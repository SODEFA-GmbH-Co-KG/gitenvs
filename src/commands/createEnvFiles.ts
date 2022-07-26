import { readFile } from 'fs/promises'
import { decryptEnvFiles } from '../lib/decryptEnvFiles'
import { saveEnvFiles } from '../lib/saveEnvFiles'
import { GenerateEnvFilesFunction } from '../lib/types/GenerateEnvFilesFunction'
import { Keys } from '../lib/types/Keys'

type CreateEnvFilesOptions = {
  stage?: string
  keys: Keys<string>
  passphrase?: string
  passphrasePath?: string
  generateEnvFiles: GenerateEnvFilesFunction<string>
}

export const createEnvFiles = async (options: CreateEnvFilesOptions) => {
  const {
    stage = process.env.GITENV_STAGE || 'development',
    generateEnvFiles,
    keys,
  } = options

  const privateKey = keys[stage].encryptedPrivateKey
  const passphrase = await getPassphrase({ ...options, stage })
  const envFiles = await decryptEnvFiles({
    generateEnvFiles,
    stage,
    privateKey,
    passphrase,
  })

  await saveEnvFiles({ envFiles })

  console.log(`🎉 all env files created`)
}

const getPassphrase = async ({
  stage,
  passphrase,
  passphrasePath = `./${stage}.passphrase`,
}: CreateEnvFilesOptions) => {
  const getKeyFromEnvVars = () => {
    const envVar = `GITENV_PRIVATE_KEY_PASSPHRASE_${stage?.toUpperCase()}`
    const envVarValue = process.env[envVar]
    return envVarValue
  }

  const getKeyFromFile = async () => {
    if (!passphrasePath) return undefined

    try {
      return await readFile(passphrasePath, 'utf8')
    } catch (error) {
      // TODO: Remove as any
      if ((error as any)?.code !== 'ENOENT') {
        throw error
      }
      return undefined
    }
  }

  return passphrase ?? getKeyFromEnvVars() ?? (await getKeyFromFile()) ?? ''
}
