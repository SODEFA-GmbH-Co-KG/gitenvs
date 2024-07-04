import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { Table } from '@/components/Table'

export default function Page({ params }: { params: { fileId: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <EnvFileSwitcher activeFileId={params.fileId} />
      <Table fileId={params.fileId} />
    </div>
  )
}
