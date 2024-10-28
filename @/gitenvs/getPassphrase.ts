import { createReadStream } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'
import { z } from 'zod'
import { getPassphraseEnvName } from './env'
import { getCwd } from './getCwd'

export const getPassphrase = async ({
  stage,
  passphrase,
  passphrasePath = join(getCwd(), `${stage}.gitenvs.passphrase`),
}: {
  stage: string
  passphrase?: string
  passphrasePath?: string
}) => {
  const getFromEnvVars = () => {
    const envName = getPassphraseEnvName({ stage })
    return process.env[envName]
  }

  const getFromFile = async () => {
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

  return passphrase ?? getFromEnvVars() ?? (await getFromFile()) ?? ''
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
