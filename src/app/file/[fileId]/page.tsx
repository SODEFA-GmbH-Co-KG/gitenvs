import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { Table } from '@/components/Table'
import { redirect } from 'next/navigation'
import { getGitenvs } from '~/gitenvs/gitenvs'

export default async function Page({ params }: { params: { fileId: string } }) {
  const gitenvs = await getGitenvs()

  if (!gitenvs.envFiles.find((file) => file.id === params.fileId)) {
    redirect(`/`)
  }

  return (
    <div className="flex flex-col gap-4">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <Table fileId={params.fileId} gitenvs={gitenvs} />
    </div>
  )
}
