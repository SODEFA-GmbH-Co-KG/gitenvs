import { readFile } from 'fs/promises'
import { join } from 'path'
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
    const currentFileContent = await readFile(passphrasePath, 'utf-8')
      .then((res) => JSON.parse(res) as Passphrase[])
      .catch(() => [])

    const requestedPassphrase = currentFileContent.find(
      (p) => p.stageName === stage,
    )?.passphrase
    if (!requestedPassphrase) {
      throw new Error(
        `Requested passphrase for stage ${stage} not found in ${PASSPHRASE_FILE_NAME}`,
      )
    }

    return requestedPassphrase
  }

  return passphrase ?? getFromEnvVars() ?? (await getFromFile()) ?? ''
}
