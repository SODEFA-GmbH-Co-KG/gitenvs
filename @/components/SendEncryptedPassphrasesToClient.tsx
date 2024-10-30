import { AtomifyPassphrase } from './AtomifyPassphrase'

import { getPassphrase } from '@/gitenvs/getPassphrase'
import { getGitenvs } from '@/gitenvs/gitenvs'
import 'server-only'
import { encryptWithEncryptionKey } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'

export const SendEncryptedPassphrasesToClient = async () => {
  const gitenvs = await getGitenvs()

  const encryptedPassphrases = await Promise.all(
    gitenvs?.envStages.map(async (stage) => {
      const passphrase = await getPassphrase({ stage: stage.name })

      return {
        stageName: stage.name,
        encryptedPassphrase: passphrase
          ? await encryptWithEncryptionKey({
              plaintext: passphrase,
              key: await getEncryptionKeyOnServer(),
            })
          : undefined,
      }
    }),
  )

  return <AtomifyPassphrase encryptedPassphrases={encryptedPassphrases} />
}
