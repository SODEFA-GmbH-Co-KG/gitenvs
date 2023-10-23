import { getGitenvs } from '~/gitenvs/gitenvs'
import { Table } from './Table'

type Params = { params: { id: string } }

export async function generateMetadata({ params }: Params) {
  const gitenvs = await getGitenvs()
  const file = gitenvs.envFiles.find((file) => file.id === params.id)

  return {
    title: file?.name,
  }
}

export default async function Page({ params }: Params) {
  return <Table fileId={params.id} />
}
