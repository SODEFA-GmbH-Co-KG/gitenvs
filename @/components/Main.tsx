import { Table } from '@/components/Table'
import { redirect } from 'next/navigation'
import { getIsGitenvsExisting } from '~/gitenvs/getIsGitenvsExisting'

export const Main = async () => {
  const isGitenvsExisting = await getIsGitenvsExisting()

  if (!isGitenvsExisting) {
    return redirect('/setup')
  }

  return <Table fileId={'ec8819f7-3a45-4be6-9989-abf2bd7573bb'} />
}
