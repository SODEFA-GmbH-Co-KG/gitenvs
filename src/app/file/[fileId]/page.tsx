import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { EnvVarsTable } from '@/components/EnvVarsTable'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { redirect } from 'next/navigation'

export default async function Page({ params }: { params: { fileId: string } }) {
  const gitenvs = await getGitenvs()

  if (!gitenvs.envFiles.find((file) => file.id === params.fileId)) {
    redirect(`/`)
  }

  return (
    <div className="flex flex-col gap-2">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <EnvVarsTable fileId={params.fileId} gitenvs={gitenvs} />
    </div>
  )
}
