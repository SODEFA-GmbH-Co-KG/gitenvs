import { AddFromClipboardDialog } from '@/components/AddFromClipboardDialog'
import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { Table } from '@/components/Table'
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
      <AddFromClipboardDialog fileId={params.fileId} />
      <Table fileId={params.fileId} gitenvs={gitenvs} />
    </div>
  )
}
