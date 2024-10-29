import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { EnvVarsTable } from '@/components/EnvVarsTable'
import { PasteEnvVars } from '@/components/PasteEnvVars'
import { getPassphrase } from '@/gitenvs/getPassphrase'
import { getGitenvs } from '@/gitenvs/gitenvs'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
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

export default async function Page({ params }: { params: { fileId: string } }) {
  const gitenvs = await getGitenvs()

  if (!gitenvs.envFiles.find((file) => file.id === params.fileId)) {
    redirect(`/`)
  }

  const passphraseContents = await Promise.all(
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

  return (
    <div className="container flex flex-col gap-2">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <EnvVarsTable fileId={params.fileId} gitenvs={gitenvs} />
      <AtomifyPassphrase encryptedPassphrases={passphraseContents} />

      <PasteEnvVars gitenvs={gitenvs} fileId={params.fileId} />
    </div>
  )
}
