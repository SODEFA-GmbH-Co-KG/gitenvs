import { Main } from '@/components/Main'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gitenvs',
}

export default async function Page() {
  return <Main />
}
