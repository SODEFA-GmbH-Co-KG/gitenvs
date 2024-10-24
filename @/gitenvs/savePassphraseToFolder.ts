import { writeFile } from 'fs/promises'
import { decryptWithEncryptionToken } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'
import { getCwd } from './getCwd'

export const savePassphraseToFolder = async ({
  encryptedPassphrase,
  stageName,
}: {
  encryptedPassphrase: {
    encryptedValue: string
    iv: string
  }
  stageName: string
}) => {
  const passphrase = await decryptWithEncryptionToken({
    ...encryptedPassphrase,
    key: await getEncryptionKeyOnServer(),
  })

  await writeFile(`${getCwd()}/${stageName}.gitenvs.passphrase`, passphrase)
}
