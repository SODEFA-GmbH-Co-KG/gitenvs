'use client'

import { Input } from '@/components/ui/input'
import { api } from '~/utils/api'

export const Table = ({ fileId }: { fileId: string }) => {
  const { data } = api.gitenvs.getForTable.useQuery({ fileId })
  const t = data?.stages

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${(data?.stages.length ?? 0) + 1}, 1fr)`,
      }}
    >
      <div></div>
      {data?.stages.map((stage) => (
        <div key={stage.name} className="flex flex-col gap-2">
          {stage.name}
        </div>
      ))}
      {Object.values(data?.varsByKey ?? {}).map((vars) => {
        return (
          <>
            <Input
              className="flex flex-col gap-2"
              defaultValue={vars[0]?.key}
            ></Input>
            {data?.stages.map((stage) => {
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
