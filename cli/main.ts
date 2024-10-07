#!/usr/bin/env node

import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { getPassphrase } from '@/gitenvs/getPassphrase'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { execSync } from 'child_process'
import { Command } from 'commander'
import { randomBytes } from 'crypto'
import { writeFile } from 'fs/promises'

const getGitenvsUiEnvVars = () => ({
  ...process.env,
  GITENVS_DIR: process.cwd(),
  GITENVS_ENCRYPTION_TOKEN: randomBytes(32).toString('hex'),
  PORT: '1337',
})

const program = new Command()

program
  .name('gitenvs')
  .description('Save your env variables in git – encrypted!')

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
      const gitenvs = await getGitenvs()

      const envStage = gitenvs.envStages.find(
        (envStage) => envStage.name === options.stage,
      )
      if (!envStage) {
        console.error(`Env stage ${options.stage} not found`)
        process.exit(1)
      }

      const passphrase = await getPassphrase({
        stage: options.stage,
        passphrase: options.passphrase,
        passphrasePath: options.passphrasePath,
      })

      const promises = []
      for (const envFile of gitenvs.envFiles) {
        const envVars = gitenvs.envVars.filter(
          (envVar) => envVar.fileId === envFile.id,
        )
        const dotenvVars = await Promise.all(
          envVars.map(async (envVar) => {
            const value = envVar.values[options.stage]
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

        const dotenvContent = dotenvVars
          .map((dotenvVar) => `${dotenvVar.key}=${dotenvVar.value}`)
          .join('\n')

        promises.push(writeFile(envFile.filePath, dotenvContent, 'utf-8'))
      }

      await Promise.allSettled(promises)
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

program
  .command('ui', { isDefault: true })
  .description('Starts a browser UI to edit env vars')
  .action(() => {
    const nodePath = process.argv0

    // start npm command with env vars
    execSync(`${nodePath} ./dist/next/server.js`, {
      stdio: 'inherit',
      env: getGitenvsUiEnvVars(),
    })
  })

program.parse()
