'use client'

import { Table } from '@/components/Table'
import { api } from '~/utils/api'
import { SetupGitenvs } from './SetupGitenvs'

export const Main = () => {
  const { data: gitenvsExists } = api.gitenvs.gitenvsJsonExists.useQuery(
    undefined,
    {
      staleTime: Infinity,
    },
  )

  if (!gitenvsExists) {
    return <SetupGitenvs />
  }

  return <Table fileId={'om234lkm234moi'} />
}
