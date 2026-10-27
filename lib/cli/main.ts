import { getCwd } from '@/gitenvs/getCwd'
import {
  checkGitenvsJsonExists,
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
import { ciEnvCommand, ciEnvCommandSchema } from './ci/ciEnvCommand'
import { createCommand, createCommandSchema } from './create/createCommand'
import { doctorCommand, doctorCommandSchema } from './doctor/doctorCommand'
import { getAvailablePort } from './getAvailablePort'
import {
  passphrasesValidateCommand,
  passphrasesValidateCommandSchema,
} from './passphrases/passphrasesCommand'
import { setCommand, setCommandSchema } from './set/setCommand'
import { setupCommand, setupCommandSchema } from './setup/setupCommand'
import { statusCommand, statusCommandSchema } from './status/statusCommand'

// test node version >= 20
const [major] = process.versions.node.split('.').map(Number)
if (major && major < 20) {
  console.error('❌ Gitenvs: Node version must be >= 20')
  process.exit(1)
}

const getGitenvsUiEnvVars = async () => {
  const { basePort, port } = await getAvailablePort(process.env.PORT)

  if (port !== basePort) {
    console.log(
      `⚠️ Gitenvs: Port ${basePort} is in use, using ${port} instead.`,
    )
  }

  return {
    ...process.env,
    GITENVS_DIR: getCwd(),
    GITENVS_ENCRYPTION_TOKEN: randomBytes(32).toString('hex'),
    PORT: String(port),
  }
}

const checkGitenvsVersion = async () => {
  const gitenvsExists = checkGitenvsJsonExists()
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
}

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
    await checkGitenvsVersion()

    const parsed = createCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await createCommand(parsed.data)
  })

program
  .command('setup')
  .description('Sets up gitenvs non-interactively for scripts and agents')
  .option(
    '--stages <stages>',
    'Comma-separated stage names',
    'development,staging,production',
  )
  .option('--file <filePath>', 'Env file path to configure', '.env')
  .option('--file-name <fileName>', 'Env file label')
  .option('--file-type <fileType>', 'Env file type: dotenv or .ts', 'dotenv')
  .option('--force', 'Overwrite gitenvs.json and passphrases')
  .option('--no-gitignore', 'Do not update .gitignore')
  .option('--no-install', 'Do not install gitenvs as a dev dependency')
  .option('--no-postinstall', 'Do not add gitenvs create to postinstall')
  .option('--no-scripts', 'Do not add scripts.gitenvs')
  .option('--yes', 'Assume yes for non-interactive setup')
  .action(async (options) => {
    const parsed = setupCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await setupCommand(parsed.data)
  })

program
  .command('set')
  .description('Add or update an env var (encrypted by default)')
  .requiredOption(
    '--file <filePath>',
    'Path of the env file from gitenvs.json (e.g. .env)',
  )
  .requiredOption('--key <key>', 'Env var key, e.g. DATABASE_URL')
  .option('--value <value>', 'Value to store')
  .option('--value-env <envName>', 'Read the value from an env var')
  .option('--value-stdin', 'Read the value from stdin')
  .option('--stage <stage>', 'Limit to a single stage; defaults to all stages')
  .option('--no-encrypt', 'Store the value as plaintext')
  .action(async (options) => {
    await checkGitenvsVersion()

    const parsed = setCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await setCommand(parsed.data)
  })

program
  .command('status')
  .description('Prints a secret-safe project status')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options) => {
    const parsed = statusCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await statusCommand(parsed.data)
  })

program
  .command('doctor')
  .description('Checks the local gitenvs setup')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options) => {
    const parsed = doctorCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await doctorCommand(parsed.data)
  })

const passphrases = program
  .command('passphrases')
  .description('Works with the local passphrase file')

passphrases
  .command('validate')
  .description('Validates gitenvs.passphrases.json without printing secrets')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options) => {
    const parsed = passphrasesValidateCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await passphrasesValidateCommand(parsed.data)
  })

const ci = program
  .command('ci')
  .description('Prints CI metadata without printing secrets')

ci.command('env')
  .description('Prints env var names needed to run gitenvs create in CI')
  .option('--stage <stage>', 'Stage to describe')
  .option('--json', 'Print machine-readable JSON')
  .action(async (options) => {
    await checkGitenvsVersion()

    const parsed = ciEnvCommandSchema.safeParse(options)

    if (!parsed.success) {
      console.error('❌ Gitenvs: Invalid options')
      console.error(parsed.error.message)
      process.exit(1)
    }

    await ciEnvCommand(parsed.data)
  })

// TODO: Should only be visible in dev mode
program
  .command('dev-ui')
  .description('Starts a browser UI to edit env vars')
  .action(async () => {
    await checkGitenvsVersion()

    // start npm command with env vars
    execSync('pnpm run dev-next', {
      stdio: 'inherit',
      env: await getGitenvsUiEnvVars(),
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
    await checkGitenvsVersion()

    const nodePath = process.argv0
    const currentDir = dirname(fileURLToPath(import.meta.url))

    // start npm command with env vars
    execSync(`${nodePath} ${currentDir}/next/server.js`, {
      stdio: 'inherit',
      env: await getGitenvsUiEnvVars(),
    })
  })

program.parse()
