import { readFile, writeFile } from 'fs/promises'
import { map, uniqBy } from 'lodash-es'
import { join } from 'path'
import { decryptWithEncryptionToken } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'
import { getCwd } from './getCwd'
import { PASSPHRASE_FILE_NAME } from './getPassphrase'
import { type Passphrase } from './gitenvs.schema'

export const savePassphrasesToFolder = async ({
  encryptedPassphrases,
}: {
  encryptedPassphrases: {
    passphrase: {
      encryptedValue: string
      iv: string
    }
    stageName: string
  }[]
}) => {
  const passphrases = await Promise.all(
    map(encryptedPassphrases, async (passphrase) => {
      return {
        passphrase: await decryptWithEncryptionToken({
          ...passphrase.passphrase,
          key: await getEncryptionKeyOnServer(),
        }),
        stageName: passphrase.stageName,
      } satisfies Passphrase
    }),
  )

  const currentFileContent = await readFile(
    join(getCwd(), PASSPHRASE_FILE_NAME),
    'utf-8',
  )
    .then((res) => JSON.parse(res) as Passphrase[])
    .catch(() => [])

  const uniquePassphrases = uniqBy(
    [...currentFileContent, ...passphrases],
    'stageName',
  )

  const path = join(getCwd(), PASSPHRASE_FILE_NAME)

  await writeFile(path, JSON.stringify(uniquePassphrases, null, 2))
}
