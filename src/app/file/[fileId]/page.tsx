import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { EnvVarsTable } from '@/components/EnvVarsTable'
import { PasteEnvVars } from '@/components/PasteEnvVars'
import { getGitenvs } from '@/gitenvs/gitenvs'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'

const HandlePastePassphrase = dynamic(
  () =>
    import('@/components/HandlePastePassphrase').then(
      (mod) => mod.HandlePastePassphrase,
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

  return (
    <div className="container flex flex-col gap-2">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <EnvVarsTable fileId={params.fileId} gitenvs={gitenvs} />
      <PasteEnvVars gitenvs={gitenvs} fileId={params.fileId} />
      <HandlePastePassphrase />
    </div>
  )
}
