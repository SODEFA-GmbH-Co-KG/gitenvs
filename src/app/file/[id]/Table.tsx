'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFieldArray } from 'react-hook-form'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'
import { api } from '~/utils/api'
import { useZodForm } from '~/utils/useZodForm'
import { EnvVarInput } from './EnvVarInput'

export const Table = ({ fileId }: { fileId: string }) => {
  const { data: gitenvs } = api.gitenvs.getGitenvs.useQuery(undefined, {
    onSuccess: (data) => {
      form.reset(data)
    },
  })
  const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()
  const utils = api.useUtils()

  const form = useZodForm({
    schema: Gitenvs,
    defaultValues: gitenvs,
  })

  const envVarsFields = useFieldArray({
    control: form.control,
    name: 'envVars',
  })

  const envVars = envVarsFields.fields

  return (
    <form
      onSubmit={form.handleSubmit((gitenvs) => saveGitenvs({ gitenvs }))}
      className="flex flex-col gap-2"
    >
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${
            (gitenvs?.envStages.length ?? 0) + 1
          }, 1fr)`,
        }}
      >
        <div></div>
        {gitenvs?.envStages.map((stage) => (
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
              {gitenvs?.envStages.map((stage) => {
                return (
                  <EnvVarInput
                    key={`${field.id}-${stage.name}`}
                    stageName={stage.name}
                    field={field}
                    index={index}
                    form={form}
                    fields={envVarsFields}
                  />
                )
              })}
            </>
          )
        })}
      </div>
      <Button
        variant="secondary"
        className="text-black"
        type="button"
        onClick={() => {
          if (!gitenvs) return
          const asdkasmdl = Object.fromEntries(
            gitenvs.envStages.map((stage) => [
              stage.name,
              { value: '', encrypted: false },
            ]),
          )
          envVarsFields.append({ fileId, key: '', values: asdkasmdl })
        }}
      >
        Add
      </Button>
      <Button variant="outline" className="text-black" type="submit">
        Save
      </Button>
    </form>
  )
}
