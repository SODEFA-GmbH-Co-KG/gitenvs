'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '~/utils/api'

export const Table = ({ fileId }: { fileId: string }) => {
  const { data } = api.gitenvs.getForTable.useQuery({ fileId })
  const { mutateAsync: saveEnvVar } = api.gitenvs.saveEnvVar.useMutation()
  const utils = api.useUtils()

  return (
    <div>
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
        {Object.values(data?.envVars ?? {}).map((envVar) => {
          return (
            <>
              <Input
                className="flex flex-col gap-2"
                defaultValue={envVar.key}
              ></Input>
              {data?.stages.map((stage) => {
                return (
                  <Input
                    key={stage.name}
                    className="flex flex-col gap-2"
                    defaultValue={envVar.values[stage.name]?.value}
                  />
                )
              })}
            </>
          )
        })}
      </div>
      <Button
        variant="outline"
        className="text-black"
        onClick={() => utils.gitenvs.invalidate()}
      >
        Save
      </Button>
    </div>
  )
}
