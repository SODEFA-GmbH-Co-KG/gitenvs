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
  const vars = gitenvs.vars.filter((v) => v.fileId === params.id)
  const stages = gitenvs.stages

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}
    ></div>
  )
}
