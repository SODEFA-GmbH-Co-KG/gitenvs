'use client'

import { Table } from '@/components/Table'
import { api } from '~/utils/api'
import { SetupGitenvs } from './SetupGitenvs'

export const Main = () => {
  const {
    data: gitenvsExists,
    refetch,
    isInitialLoading,
  } = api.gitenvs.gitenvsJsonExists.useQuery(undefined, {
    staleTime: Infinity,
  })

  if (isInitialLoading) {
    return null
  }

  if (!gitenvsExists) {
    return <SetupGitenvs onSetupDone={() => refetch()} />
  }

  return <Table fileId={'om234lkm234moi'} />
}
