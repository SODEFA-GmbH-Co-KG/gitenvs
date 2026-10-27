import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import {
  type EnvFile,
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'

export const getFileContent = async ({
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
  const needsShellQuoting = /[\s#"'`$&|;<>(){}!*?\[\]\\]/.test(value)
  const includesDoubleQuote = value.includes('"')
  const includesSingleQuote = value.includes("'")

  let wrapWith = ''

  if (needsShellQuoting) {
    if (!includesSingleQuote) {
      wrapWith = "'"
    } else if (!includesDoubleQuote && !/[`$\\]/.test(value)) {
      wrapWith = '"'
    } else {
      throw new Error(
        `❌ Gitenvs: "${key}" cannot be represented in a dotenv file that is both dotenv-parser compatible and shell-sourceable.`,
      )
    }

    console.log(
      `⚠️ Gitenvs: wrapping "${key}" with ${wrapWith} quotes because it includes shell-sensitive characters`,
    )
  }

  return `${key}=${wrapWith}${value}${wrapWith}`
}

const getTsLine = ({ key, value }: { key: string; value: string }) => {
  const includesDoubleQuote = value.includes('"')
  const includesSingleQuote = value.includes("'")
  const includesBacktick = value.includes('`')

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
