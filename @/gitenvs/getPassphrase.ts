import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { z } from 'zod'

export const getPassphrase = async ({
  stage,
  passphrase,
  passphrasePath = `${process.env.GITENVS_DIR || process.cwd()}/${stage}.gitenvs.passphrase`,
}: {
  stage: string
  passphrase?: string
  passphrasePath?: string
}) => {
  const getFromEnvVars = () => {
    const passphrase = process.env[`GITENVS_PASSPHRASE_${stage?.toUpperCase()}`]
    return passphrase
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
