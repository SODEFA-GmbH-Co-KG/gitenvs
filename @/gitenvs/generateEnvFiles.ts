import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { getCwd } from '@/gitenvs/getCwd'
import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getPassphrase, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs, getIsLatestGitenvsVersion } from '@/gitenvs/gitenvs'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export const AUTO_GEN_HEADLINE = (stage: string) =>
  `Gitenvs auto-generated this file for stage: ${stage}`

export const generateEnvFiles = async (options: {
  stage: string
  passphrase?: string
  passphrasePath?: string
}) => {
  const gitenvsExists = await getIsGitenvsExisting()
  if (!gitenvsExists) {
    console.error('❌ Gitenvs: gitenvs.json not found')
    process.exit(1)
  }

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

  const envStage = gitenvs.envStages.find((envStage) => envStage.name === stage)
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

  const headline = AUTO_GEN_HEADLINE(stage)

  const promises = []
  for (const envFile of gitenvs.envFiles) {
    const envVars = gitenvs.envVars.filter((envVar) =>
      envVar.fileIds.includes(envFile.id),
    )

    console.log(`🔒 Gitenvs: Creating ${envFile.name} file for stage: ${stage}`)
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
            const includesDoubleQuote = dotenvVar.value?.includes('"') ?? false
            const includesSingleQuote = dotenvVar.value?.includes("'") ?? false

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

        const fileContent = `# ${headline}\n\n${dotenvContent}`

        promises.push(
          writeFile(join(getCwd(), envFile.filePath), fileContent, 'utf-8'),
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

        const fileContent = `// ${headline}\n\n${tsEnvContent}`

        promises.push(
          writeFile(join(getCwd(), envFile.filePath), fileContent, 'utf-8'),
        )
        break
      }
    }

    await Promise.allSettled(promises)
  }
}
