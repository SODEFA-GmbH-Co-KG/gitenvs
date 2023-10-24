import { Table } from '@/components/Table'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gitenvs',
}

export default async function Page() {
  return <Table fileId={'om234lkm234moi'} />
}
