import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getPassphraseEnvName } from './env'
import { getCwd } from './getCwd'
import { type Passphrase } from './gitenvs.schema'

export const PASSPHRASE_FILE_NAME = 'gitenvs.passphrases.json'

export const getPassphrase = async ({
  stage,
  passphrase,
  passphrasePath = join(getCwd(), PASSPHRASE_FILE_NAME),
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
      const currentFileContent = await readFile(
        join(getCwd(), PASSPHRASE_FILE_NAME),
        'utf-8',
      )
        .then((res) => JSON.parse(res) as Passphrase[])
        .catch(() => [])
      return currentFileContent.find((p) => p.stageName === stage)?.passphrase
    } catch (error) {
      const parsedError = z.object({ code: z.string() }).safeParse(error)
      // TODO: ist das wichtig, dass der error geschmissen wird wenns das file nicht gibt?
      if (parsedError.success && parsedError.data.code !== 'ENOENT') {
        throw error
      }
      return undefined
    }
  }

  return passphrase ?? getFromEnvVars() ?? (await getFromFile()) ?? ''
}
