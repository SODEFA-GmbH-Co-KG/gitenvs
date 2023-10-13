import { Input } from '@/components/ui/input'
import groupBy from 'lodash/groupBy'
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
  const varsByKey = groupBy(vars, (v) => v.key)

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${stages.length + 1}, 1fr)` }}
    >
      <div></div>
      {stages.map((stage) => (
        <div key={stage.name} className="flex flex-col gap-2">
          {stage.name}
        </div>
      ))}
      {Object.values(varsByKey).map((vars) => {
        return (
          <>
            <Input
              className="flex flex-col gap-2"
              defaultValue={vars[0]?.key}
            ></Input>
            {stages.map((stage) => {
              const v = vars.find((v) => v.stage === stage.name)
              return (
                <Input
                  key={stage.name}
                  className="flex flex-col gap-2"
                  defaultValue={v?.value}
                />
              )
            })}
          </>
        )
      })}
    </div>
  )
}
