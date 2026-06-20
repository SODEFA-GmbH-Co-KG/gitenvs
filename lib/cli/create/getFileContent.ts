import {
  type EnvFile,
  type EnvStage,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import { resolveEnvVars } from '../resolveEnvVars'

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
  const resolvedEnvVars = await resolveEnvVars({
    gitenvs,
    envFile,
    envStage,
    passphrase,
  })

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
