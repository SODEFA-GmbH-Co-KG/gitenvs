import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { EnvVarsTable } from '@/components/EnvVarsTable'
import { PasteEnvVars } from '@/components/PasteEnvVars'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { redirect } from 'next/navigation'

export default async function Page({
  params,
  searchParams,
}: {
  params: { fileId: string }
  searchParams: Promise<{ query?: string }>
}) {
  const { query } = await searchParams
  const gitenvs = await getGitenvs()

  if (!gitenvs.envFiles.find((file) => file.id === params.fileId)) {
    redirect(`/`)
  }

  return (
    <div className="container flex flex-col gap-2">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <EnvVarsTable fileId={params.fileId} gitenvs={gitenvs} query={query} />
      <PasteEnvVars gitenvs={gitenvs} fileId={params.fileId} />
    </div>
  )
}
