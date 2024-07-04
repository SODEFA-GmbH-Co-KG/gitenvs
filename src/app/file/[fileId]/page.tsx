import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { Table } from '@/components/Table'
import { getGitenvs } from '~/gitenvs/gitenvs'

export default async function Page({ params }: { params: { fileId: string } }) {
  const gitenvs = await getGitenvs()

  return (
    <div className="flex flex-col gap-4">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <Table fileId={params.fileId} gitenvs={gitenvs} />
    </div>
  )
}
