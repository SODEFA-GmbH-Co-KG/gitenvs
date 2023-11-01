'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { map } from 'lodash'
import { useFieldArray } from 'react-hook-form'
import { encryptEnvVar } from '~/gitenvs/encryptEnvVar'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'
import { api } from '~/utils/api'
import { useZodForm } from '~/utils/useZodForm'
import { EnvVarInput } from './EnvVarInput'

export const Table = ({ fileId }: { fileId: string }) => {
  const { data: gitenvs } = api.gitenvs.getGitenvs.useQuery(undefined, {
    // TODO: This is not how you should do it. onSuccess will be deprecated in future.
    onSuccess: (data) => {
      if (form.formState.isDirty) return
      form.reset(data)
    },
  })
  const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()

  const form = useZodForm({
    schema: Gitenvs,
    // defaultValues: gitenvs,
  })

  const envVarsFields = useFieldArray({
    control: form.control,
    name: 'envVars',
  })

  const envVars = envVarsFields.fields

  return (
    <form
      // TODO: Handle zod parsing errors
      onSubmit={form.handleSubmit(async (newGitenvs) => {
        const encryptedEnvVars = await Promise.all(
          newGitenvs.envVars.map(async (envVar) => {
            const oldEnvVar = gitenvs?.envVars.find(
              (envVar) =>
                envVar.fileId === envVar.fileId && envVar.key === envVar.key,
            )

            const valuesEntries = await Promise.all(
              map(Object.entries(envVar.values), async (data) => {
                const [stageName, value] = data

                if (!value.encrypted) return data

                if (value.value === oldEnvVar?.values[stageName]?.value) {
                  return data
                }

                const publicKey = gitenvs?.envStages.find(
                  (stage) => stage.name === stageName,
                )?.publicKey

                if (!publicKey) throw new Error('No public key found')

                return [
                  stageName,
                  {
                    ...value,
                    value: await encryptEnvVar({
                      plaintext: value.value,
                      publicKey,
                    }),
                  },
                ] as const
              }),
            )

            const values = Object.fromEntries(valuesEntries)

            return {
              ...envVar,
              values,
            }
          }),
        )
        await saveGitenvs({
          gitenvs: {
            ...newGitenvs,
            envVars: encryptedEnvVars,
          },
        })
      })}
      className="flex flex-col gap-2"
      autoComplete="new-password"
    >
      {!!envVars.length ? (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${
              (gitenvs?.envStages.length ?? 0) + 1
            }, 1fr)`,
          }}
        >
          <div>Env Name</div>
          {gitenvs?.envStages.map((stage) => (
            <div key={stage.name} className="flex flex-col gap-2">
              {stage.name}
            </div>
          ))}
          {envVars.map((field, index) => {
            if (field.fileId !== fileId) return null
            return (
              <>
                <Input
                  className="flex flex-col gap-2"
                  key={field.id}
                  {...form.register(`envVars.${index}.key`)}
                  autoComplete="new-password"
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
      ) : (
        <p>No env vars so far. Add a new one</p>
      )}
      <Button
        variant="secondary"
        className="text-black"
        type="button"
        onClick={() => {
          if (!gitenvs) return
          const values = Object.fromEntries(
            gitenvs.envStages.map((stage) => [
              stage.name,
              { value: '', encrypted: true },
            ]),
          )
          envVarsFields.append({ fileId, key: '', values })
        }}
      >
        Add
      </Button>
      <Button variant="outline" type="submit">
        Save
      </Button>
    </form>
  )
}
