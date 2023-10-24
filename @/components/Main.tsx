'use client'

import { Table } from '@/components/Table'
import { api } from '~/utils/api'

export const Main = () => {
  const { data: gitenvsExists } = api.gitenvs.gitenvsJsonExists.useQuery()

  if (gitenvsExists) {
    return <Table fileId={'om234lkm234moi'} />
  }

  return <div>TODO</div>
}
