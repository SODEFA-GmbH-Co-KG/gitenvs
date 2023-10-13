import { getGitenvs } from '~/gitenvs/getGitenvs'

export default async function Page({ params }: { params: { id: string } }) {
  const gitenvs = await getGitenvs()
  const file = gitenvs.files.find((file) => file.id === params.id)

  return <div>You selected {file?.name}</div>
}
