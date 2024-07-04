import { Table } from '@/components/Table'

export default function Page({ params }: { params: { fileId: string } }) {
  return <Table fileId={params.fileId} />
}
