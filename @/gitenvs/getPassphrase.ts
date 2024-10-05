import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { z } from 'zod'

export const getPassphrase = async ({
  stage,
  passphrase,
  passphrasePath = `${process.cwd()}/${stage}.passphrase`,
}: {
  stage: string
  passphrase?: string
  passphrasePath?: string
}) => {
  const getKeyFromEnvVars = () => {
    const envVar = `GITENV_PRIVATE_KEY_PASSPHRASE_${stage?.toUpperCase()}`
    const envVarValue = process.env[envVar]
    return envVarValue
  }

  const getKeyFromFile = async () => {
    if (!passphrasePath) return undefined

    try {
      return await readFirstLine(passphrasePath)
    } catch (error) {
      const parsedError = z.object({ code: z.string() }).safeParse(error)
      if (parsedError.success && parsedError.data.code !== 'ENOENT') {
        throw error
      }
      return undefined
    }
  }

  return passphrase ?? getKeyFromEnvVars() ?? (await getKeyFromFile()) ?? ''
}

const readFirstLine = async (pathToFile: string): Promise<string> => {
  const readable = createReadStream(pathToFile, { encoding: 'utf8' })
  const reader = createInterface({ input: readable })
  const line = await new Promise<string>((resolve) => {
    reader.on('line', (line) => {
      reader.close()
      resolve(line)
    })
  })
  readable.close()
  return line
}
