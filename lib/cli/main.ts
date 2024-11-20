import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { getCwd } from '@/gitenvs/getCwd'
import { getPassphrase, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import {
  getGitenvs,
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
          const { fileId, ...rest } = envVar
          return {
            ...rest,
            fileIds: [fileId],
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
  .action(
    async (options: {
      stage: string
      passphrase: string
      passphrasePath: string
    }) => {
      const isLatestGitenvsVersion = await getIsLatestGitenvsVersion()
      if (!isLatestGitenvsVersion) {
        console.error(
          `❌ Gitenvs: Version is not latest. Please run \`gitenvs migrate\` to migrate to the latest version.`,
        )
        process.exit(1)
      }

      const gitenvs = await getGitenvs()
      const stage = process.env[GITENVS_STAGE_ENV_NAME] ?? options.stage

      if (!stage) {
        console.error(
          `Stage is required. Set it with --stage <stage> or with env var: ${GITENVS_STAGE_ENV_NAME}`,
        )
        process.exit(1)
      }

      const envStage = gitenvs.envStages.find(
        (envStage) => envStage.name === stage,
      )
      if (!envStage) {
        console.error(`Env stage ${stage} not found`)
        process.exit(1)
      }

      const passphrase = await getPassphrase({
        stage: stage,
        passphrase: options.passphrase,
        passphrasePath: options.passphrasePath,
      })

      if (!passphrase) {
        console.error(
          `Requested passphrase for stage ${stage} not found in ${options.passphrasePath ?? join(getCwd(), PASSPHRASE_FILE_NAME)}`,
        )
        process.exit(1)
      }

      const promises = []
      for (const envFile of gitenvs.envFiles) {
        const envVars = gitenvs.envVars.filter((envVar) =>
          envVar.fileIds.includes(envFile.id),
        )

        console.log(
          `🔒 Gitenvs: Creating ${envFile.name} file for stage: ${stage}`,
        )
        const dotenvVars = await Promise.all(
          envVars.map(async (envVar) => {
            const value = envVar.values[stage]
            if (!value) return { key: envVar.key, value: '' }
            if (!value.encrypted) {
              return {
                key: envVar.key,
                value: value.value,
              }
            }

            // TODO: Whats on error?
            return {
              key: envVar.key,
              value: await decryptEnvVar({
                encrypted: value.value,
                encryptedPrivateKey: envStage.encryptedPrivateKey,
                passphrase,
              }),
            }
          }),
        )

        switch (envFile.type) {
          case 'dotenv': {
            const dotenvContent = dotenvVars
              .map((dotenvVar) => {
                console.log(
                  `🔒 Gitenvs: Writing "${dotenvVar.key}" to ${envFile.filePath}`,
                )

                const includesCommentCharacter =
                  dotenvVar.value?.includes('#') ?? false
                const includesDoubleQuote =
                  dotenvVar.value?.includes('"') ?? false
                const includesSingleQuote =
                  dotenvVar.value?.includes("'") ?? false

                let wrapWith = ''
                if (includesCommentCharacter) {
                  if (includesSingleQuote && includesDoubleQuote) {
                    throw new Error(
                      `❌ Gitenvs: "${dotenvVar.key}" includes both single and double quotes and a comment character. This is not supported and will result in unexpected values.`,
                    )
                  }
                  if (includesDoubleQuote) {
                    wrapWith = "'"
                  } else {
                    wrapWith = '"'
                  }

                  console.log(
                    `⚠️ Gitenvs: wrapping "${dotenvVar.key}" with ${wrapWith} quotes because it includes a comment character`,
                  )
                }

                return `${dotenvVar.key}=${wrapWith}${dotenvVar.value}${wrapWith}`
              })
              .join('\n')

            promises.push(
              writeFile(
                join(getCwd(), envFile.filePath),
                dotenvContent,
                'utf-8',
              ),
            )
            break
          }
          case '.ts': {
            const tsEnvContent = dotenvVars
              .map((envVar) => {
                console.log(
                  `🔒 Gitenvs: Writing "${envVar.key}" to ${envFile.filePath}`,
                )

                const includesDoubleQuote = envVar.value?.includes('"') ?? false
                const includesSingleQuote = envVar.value?.includes("'") ?? false
                const includesBacktick = envVar.value?.includes('`') ?? false

                let wrapWith = "'"

                if (
                  includesSingleQuote &&
                  includesDoubleQuote &&
                  includesBacktick
                ) {
                  throw new Error(
                    `❌ Gitenvs: "${envVar.key}" includes all string encasing characters. This is not supported and will result in unexpected values.`,
                  )
                }
                if (includesSingleQuote) {
                  if (!includesBacktick) {
                    wrapWith = '`'
                  } else {
                    wrapWith = '"'
                  }
                }

                return `export const ${envVar.key} = process.env.${envVar.key} ?? ${wrapWith}${envVar.value}${wrapWith}`
              })
              .join('\n')

            promises.push(
              writeFile(
                join(getCwd(), envFile.filePath),
                tsEnvContent,
                'utf-8',
              ),
            )
            break
          }
        }

        await Promise.allSettled(promises)
      }
    },
  )

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
    const isLatestGitenvsVersion = await getIsLatestGitenvsVersion()
    if (!isLatestGitenvsVersion) {
      console.error(
        `❌ Gitenvs: Version is not latest. Please run \`gitenvs migrate\` to migrate to the latest version.`,
      )
      process.exit(1)
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
