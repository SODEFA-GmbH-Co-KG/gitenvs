import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { getCwd } from '@/gitenvs/getCwd'
import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getPassphrase, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs, getIsLatestGitenvsVersion } from '@/gitenvs/gitenvs'
import {
  type EnvFile,
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

export const createCommandSchema = z.object({
  stage: z.string(),
  passphrase: z.string(),
  passphrasePath: z.string(),
})

export const createCommand = async (
  options: z.infer<typeof createCommandSchema>,
) => {
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

  const filePromises = gitenvs.envFiles.map(async (envFile) => {
    console.log(`🔒 Gitenvs: Creating ${envFile.name} file for stage: ${stage}`)

    const fileContent = await getFileContent({
      gitenvs,
      envFile,
      envStage,
      passphrase,
    })

    return writeFile(join(getCwd(), envFile.filePath), fileContent, 'utf-8')
  })

  await Promise.allSettled(filePromises)
}

const getFileContent = async ({
  gitenvs,
  envFile,
  envStage,
  passphrase,
}: {
  gitenvs: Gitenvs
  envFile: EnvFile
  envStage: EnvStage
  passphrase: string
}) => {
  const resolvedEnvVars = (
    await Promise.all(
      gitenvs.envVars
        .filter((envVar) => envVar.fileIds.includes(envFile.id))
        .map(async (envVar) => resolveEnvVar({ envVar, envStage, passphrase })),
    )
  ).filter((dotenvVar) => !!dotenvVar.value)

  const lines = resolvedEnvVars.map((envVar) => {
    console.log(`🔒 Gitenvs: Writing "${envVar.key}" to ${envFile.filePath}`)

    switch (envFile.type) {
      case 'dotenv':
        return getDotenvLine(envVar)
      case '.ts':
        return getTsLine(envVar)
    }
  })

  const fileContent = lines.join('\n')

  return fileContent
}

const resolveEnvVar = async ({
  envVar,
  envStage,
  passphrase,
}: {
  envVar: EnvVar
  envStage: EnvStage
  passphrase: string
}): Promise<{ key: string; value: string }> => {
  const config = envVar.values[envStage.name]

  if (!config) return { key: envVar.key, value: '' }

  let value = config?.value ?? ''

  if (config.encrypted) {
    value =
      (await decryptEnvVar({
        encrypted: value,
        encryptedPrivateKey: envStage.encryptedPrivateKey,
        passphrase,
      })) ?? ''
  }

  if (config.isFunction) {
    try {
      value = eval(value) // TODO: More secure way to evaluate functions
      if (typeof value !== 'string') {
        value = String(value)
      }
    } catch (error) {
      console.error(`❌ Gitenvs: Error evaluating function "${envVar.key}"`)
      console.error(error)
      process.exit(1)
    }
  }

  return {
    key: envVar.key,
    value,
  }
}

const getDotenvLine = ({ key, value }: { key: string; value: string }) => {
  const includesCommentCharacter = value.includes('#') ?? false
  const includesDoubleQuote = value.includes('"') ?? false
  const includesSingleQuote = value.includes("'") ?? false

  let wrapWith = ''

  if (includesCommentCharacter) {
    if (includesSingleQuote && includesDoubleQuote) {
      throw new Error(
        `❌ Gitenvs: "${key}" includes both single and double quotes and a comment character. This is not supported and will result in unexpected values.`,
      )
    }
    if (includesDoubleQuote) {
      wrapWith = "'"
    } else {
      wrapWith = '"'
    }

    console.log(
      `⚠️ Gitenvs: wrapping "${key}" with ${wrapWith} quotes because it includes a comment character`,
    )
  }

  return `${key}=${wrapWith}${value}${wrapWith}`
}

const getTsLine = ({ key, value }: { key: string; value: string }) => {
  const includesDoubleQuote = value.includes('"') ?? false
  const includesSingleQuote = value.includes("'") ?? false
  const includesBacktick = value.includes('`') ?? false

  let wrapWith = "'"

  if (includesSingleQuote && includesDoubleQuote && includesBacktick) {
    throw new Error(
      `❌ Gitenvs: "${key}" includes all string encasing characters. This is not supported and will result in unexpected values.`,
    )
  }
  if (includesSingleQuote) {
    if (!includesBacktick) {
      wrapWith = '`'
    } else {
      wrapWith = '"'
    }
  }

  return `export const ${key} = process.env.${key} ?? ${wrapWith}${value}${wrapWith}`
}
