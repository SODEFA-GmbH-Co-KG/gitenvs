import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import {
  type EnvFile,
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import { evaluateFunction } from './evaluateFunction'

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
    const plaintext = await decryptEnvVar({
      encrypted: value,
      encryptedPrivateKey: envStage.encryptedPrivateKey,
      passphrase,
    })
    if (plaintext === undefined) {
      throw new Error(
        `❌ Gitenvs: Could not decrypt "${envVar.key}" for stage ${envStage.name}. Is the passphrase correct?`,
      )
    }
    value = plaintext
  }

  if (config.isFunction) {
    try {
      value = await evaluateFunction({ code: value })
    } catch (error) {
      throw new Error(
        `❌ Gitenvs: Error evaluating function "${envVar.key}": ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      )
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

// Modules are strict mode code, so strict mode reserved words are not allowed either
const RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

const getTsLine = ({ key, value }: { key: string; value: string }) => {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) || RESERVED_WORDS.has(key)) {
    throw new Error(
      `❌ Gitenvs: "${key}" is not a valid JavaScript identifier and cannot be exported from a .ts file.`,
    )
  }

  // JSON.stringify creates a valid string literal with all special characters escaped
  return `export const ${key} = process.env.${key} ?? ${JSON.stringify(value)}`
}
