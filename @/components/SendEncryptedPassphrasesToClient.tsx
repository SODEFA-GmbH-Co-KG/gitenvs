import { getCwd } from '@/gitenvs/getCwd'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { readFile } from 'fs/promises'
import dynamic from 'next/dynamic'
import { join } from 'path'
import 'server-only'
import { encryptWithEncryptionKey } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'

const AtomifyPassphrase = dynamic(
  () =>
    import('@/components/AtomifyPassphrase').then(
      (mod) => mod.AtomifyPassphrase,
    ),
  {
    ssr: false,
  },
)

export const SendEncryptedPassphrasesToClient = async () => {
  const gitenvs = await getGitenvs()

  const encryptedPassphrases = await Promise.all(
    gitenvs?.envStages.map(async (stage) => {
      const passphrase = await readFile(
        join(getCwd(), `${stage.name}.gitenvs.passphrase`),
        'utf-8',
      ).catch(() => null)

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
