import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import {
  type EnvFile,
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'

export type ResolvedEnvVar = {
  key: string
  value: string
}

export const resolveEnvVars = async ({
  gitenvs,
  envFile,
  envStage,
  passphrase,
}: {
  gitenvs: Gitenvs
  envFile?: EnvFile
  envStage: EnvStage
  passphrase: string
}) => {
  return (
    await Promise.all(
      gitenvs.envVars
        .filter((envVar) => !envFile || envVar.fileIds.includes(envFile.id))
        .map(async (envVar) => resolveEnvVar({ envVar, envStage, passphrase })),
    )
  ).filter((envVar) => !!envVar.value)
}

const resolveEnvVar = async ({
  envVar,
  envStage,
  passphrase,
}: {
  envVar: EnvVar
  envStage: EnvStage
  passphrase: string
}): Promise<ResolvedEnvVar> => {
  const config = envVar.values[envStage.name]

  if (!config) return { key: envVar.key, value: '' }

  let value = config.value ?? ''

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
