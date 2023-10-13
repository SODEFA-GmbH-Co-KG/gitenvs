import { getGitenvs } from '~/gitenvs/getGitenvs'

type Params = { params: { id: string } }

export async function generateMetadata({ params }: Params) {
  const gitenvs = await getGitenvs()
  const file = gitenvs.files.find((file) => file.id === params.id)

  return {
    title: file?.name,
  }
}

export default async function Page({ params }: Params) {
  const gitenvs = await getGitenvs()
  const file = gitenvs.files.find((file) => file.id === params.id)

  return <div>You selected {file?.name}</div>
}
