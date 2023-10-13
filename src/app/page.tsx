import { Input } from '@/components/ui/input'
import { Metadata } from 'next'
import { getGitenvs } from '~/gitenvs/getGitenvs'

export const metadata: Metadata = {
  title: 'Gitenvs',
}

export default async function Page() {
  const gitenvs = await getGitenvs()

  return (
    <>
      <Input />
    </>
  )
}
