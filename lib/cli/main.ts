import { getCwd } from '@/gitenvs/getCwd'
import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import {
  getGitenvsVersion,
  getIsLatestGitenvsVersion,
  latestGitenvsVersion,
  saveGitenvs,
} from '@/gitenvs/gitenvs'
import { type Gitenvs, Gitenvs1 } from '@/gitenvs/gitenvs.schema'
import { execSync } from 'child_process'
import { Command } from 'commander'
import { randomBytes } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createCommand, createCommandSchema } from './create/createCommand'

// test node version >= 20
const [major] = process.versions.node.split('.').map(Number)
if (major && major < 20) {
  console.error('❌ Gitenvs: Node version must be >= 20')
  process.exit(1)
}

const getGitenvsUiEnvVars = () => ({
  ...process.env,
  GITENVS_DIR: getCwd(),
  GITENVS_ENCRYPTION_TOKEN: randomBytes(32).toString('hex'),
  PORT: '1337',
})

const program = new Command()

program
  .name('gitenvs')
  .description('Save your env variables in git – encrypted!')

program.command('migrate').action(async () => {
  let isLatestVersion = false
  while (!isLatestVersion) {
    let currentVersion
    try {
      currentVersion = await getGitenvsVersion()
    } catch (error) {
      console.error('❌ Gitenvs: cannot read version')
      process.exit(1)
    }

    if (currentVersion === latestGitenvsVersion) {
      isLatestVersion = true
      console.log(`✅ Gitenvs: On latest version v${latestGitenvsVersion}`)
      break
    }

    console.log(
      `🔄 Gitenvs: Migrating from v${currentVersion} to v${currentVersion + 1}`,
    )

    const gitenvsContent = await readFile(
      join(getCwd(), 'gitenvs.json'),
      'utf-8',
    )
    const jsonParsedGitenvsContent = JSON.parse(gitenvsContent)

    if (currentVersion === 1) {
      const gitenvs1 = Gitenvs1.parse(jsonParsedGitenvsContent)

      const migrated = {
        ...gitenvs1,
        version: '2',
        envVars: gitenvs1.envVars.map((envVar) => {
          const { fileId, id, key, values } = envVar
          return {
            id,
            fileIds: [fileId],
            key,
            values,
          }
        }),
      } satisfies Gitenvs

      await saveGitenvs(migrated)
    }
  }
})

program
  .command('create')
  .description('Creates env files')
  .option(
    '--stage <stage>',
    'Example: production, staging, development',
    'development',
  )
  .option('--passphrase <passphrase>')
  .option('--passphrasePath <passphrasePath>')
  .action(async (options) => {
    const parsed = createCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await createCommand(parsed.data)
  })

// TODO: Should only be visible in dev mode
program
  .command('dev-ui')
  .description('Starts a browser UI to edit env vars')
  .action(() => {
    // start npm command with env vars
    execSync('pnpm run dev-next', {
      stdio: 'inherit',
      env: getGitenvsUiEnvVars(),
    })
  })

// TODO: Should only be visible in dev mode
program
  .command('init-playground')
  .description('Initializes the playground')
  .action(async () => {
    await mkdir('playground', { recursive: true })
    await writeFile(
      'playground/package.json',
      JSON.stringify(
        {
          name: 'playground',
          version: '1.0.0',
          private: true,
        },
        null,
        2,
      ),
      'utf-8',
    )
  })

program
  .command('ui', { isDefault: true })
  .description('Starts a browser UI to edit env vars')
  .action(async () => {
    const gitenvsExists = await getIsGitenvsExisting()
    // check version if gitenvs exists
    if (gitenvsExists) {
      const isLatestGitenvsVersion = await getIsLatestGitenvsVersion()
      if (!isLatestGitenvsVersion) {
        console.error(
          `❌ Gitenvs: Version is not latest. Please run \`gitenvs migrate\` to migrate to the latest version.`,
        )
        process.exit(1)
      }
    }

    const nodePath = process.argv0
    const currentDir = dirname(fileURLToPath(import.meta.url))

    // start npm command with env vars
    execSync(`${nodePath} ${currentDir}/next/server.js`, {
      stdio: 'inherit',
      env: getGitenvsUiEnvVars(),
    })
  })

program.parse()
