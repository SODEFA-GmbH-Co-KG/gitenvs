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

  return <Table fileId={'ec8819f7-3a45-4be6-9989-abf2bd7573bb'} />
}
