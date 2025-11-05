import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { EnvVarsTable } from '@/components/EnvVarsTable'
import { MainDropdown } from '@/components/MainDropdown'
import { PasteEnvVars } from '@/components/PasteEnvVars'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { redirect } from 'next/navigation'

export default async function Page({
  params,
  searchParams,
}: {
  params: { fileId: string }
  searchParams: Promise<{ query?: string; sortAsc?: boolean }>
}) {
  const { query, sortAsc } = await searchParams
  const gitenvs = await getGitenvs()

  if (!gitenvs.envFiles.find((file) => file.id === params.fileId)) {
    redirect(`/`)
  }

  return (
    <div className="container flex flex-col gap-2">
      <div className="flex gap-4">
        <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
        <MainDropdown className="self-start" />
      </div>
      <EnvVarsTable
        fileId={params.fileId}
        gitenvs={gitenvs}
        query={query}
        sortAsc={sortAsc}
      />
      <PasteEnvVars gitenvs={gitenvs} fileId={params.fileId} />
    </div>
  )
}
