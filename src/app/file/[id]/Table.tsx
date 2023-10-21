'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFieldArray } from 'react-hook-form'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'
import { api } from '~/utils/api'
import { useZodForm } from '~/utils/useZodForm'

export const Table = ({ fileId }: { fileId: string }) => {
  const { data } = api.gitenvs.getGitenvs.useQuery(undefined, {
    onSuccess: (data) => {
      form.reset(data)
    },
  })
  const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()
  const utils = api.useUtils()

  const form = useZodForm({
    schema: Gitenvs,
    defaultValues: data,
  })

  const {
    fields: envVars,
    append,
    prepend,
    remove,
    swap,
    move,
    insert,
  } = useFieldArray({
    control: form.control,
    name: 'envVars',
  })

  return (
    <form onSubmit={form.handleSubmit((gitenvs) => saveGitenvs({ gitenvs }))}>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${
            (data?.envStages.length ?? 0) + 1
          }, 1fr)`,
        }}
      >
        <div></div>
        {data?.envStages.map((stage) => (
          <div key={stage.name} className="flex flex-col gap-2">
            {stage.name}
          </div>
        ))}
        {envVars.map((field, index) => {
          return (
            <>
              <Input
                className="flex flex-col gap-2"
                key={field.id}
                {...form.register(`envVars.${index}.key`)}
              ></Input>
              {data?.envStages.map((stage) => {
                return (
                  <Input
                    key={`${field.id}-${stage.name}`}
                    className="flex flex-col gap-2"
                    {...form.register(
                      `envVars.${index}.values.${stage.name}.value`,
                    )}
                  />
                )
              })}
            </>
          )
        })}
      </div>
      <Button variant="outline" className="text-black" type="submit">
        Save
      </Button>
    </form>
  )
}
