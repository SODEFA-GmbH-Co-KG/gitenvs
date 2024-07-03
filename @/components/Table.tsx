'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import NiceModal from '@ebay/nice-modal-react'
import { map } from 'lodash-es'
import { Fragment, useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { encryptEnvVar } from '~/gitenvs/encryptEnvVar'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '~/gitenvs/idsGenerator'
import { api } from '~/utils/api'
import { useZodForm } from '~/utils/useZodForm'
import { EditDialog } from './EditDialog'

export const Table = ({ fileId }: { fileId: string }) => {
  const trpcUtils = api.useUtils()
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
  const columns = (gitenvs?.envStages.length ?? 0) + 1

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        document.activeElement?.parentElement?.id !== 'supergrid' &&
        !(document.activeElement instanceof HTMLInputElement)
      ) {
        if (
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowDown'
        ) {
          document
            .querySelector<HTMLElement>('#supergrid > *[tabindex="0"]')
            ?.focus()
          return
        }
      } else {
        if (event.key === 'ArrowLeft') {
          const element = document.activeElement?.previousElementSibling
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
        if (event.key === 'ArrowRight') {
          const element = document.activeElement?.nextElementSibling
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
        if (event.key === 'ArrowUp') {
          let element: Element | null | undefined = document.activeElement
          for (let i = 0; i < columns; i++) {
            element = element?.previousElementSibling
          }
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
        if (event.key === 'ArrowDown') {
          let element: Element | null | undefined = document.activeElement
          for (let i = 0; i < columns; i++) {
            element = element?.nextElementSibling
          }
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [columns])

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
          id="supergrid"
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
          <div>Passphrase</div>
          {gitenvs?.envStages.map((stage) => (
            <Input
              key={stage.name}
              className="flex flex-col gap-2"
              autoComplete="new-password"
              type="password"
            ></Input>
          ))}
          <div>Key</div>
          {gitenvs?.envStages.map((stage) => (
            <div key={stage.name} className="flex flex-col gap-2">
              {stage.name}
            </div>
          ))}
          {gitenvs?.envVars.map((envVar, index) => {
            if (envVar.fileId !== fileId) return null
            return (
              <Fragment key={index}>
                <div tabIndex={0} onClick={() => console.log('key')}>
                  {envVar.key}
                </div>

                {gitenvs?.envStages.map((stage) => {
                  const handler = async () => {
                    const activeElement = document.activeElement
                    try {
                      await NiceModal.show(EditDialog, {
                        envVar,
                        envStage: stage,
                        gitenvs,
                      })
                    } finally {
                      setTimeout(() => {
                        if (activeElement instanceof HTMLElement) {
                          activeElement.focus()
                        }
                      }, 0)
                    }
                  }
                  return (
                    <div
                      key={`${envVar.key}-${stage.name}`}
                      tabIndex={0}
                      onClick={handler}
                      onKeyDown={(event) => event.key === 'Enter' && handler()}
                      className="cursor-pointer"
                    >
                      {envVar.values[stage.name]?.value}
                    </div>
                  )
                })}
              </Fragment>
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
        onClick={async () => {
          if (!gitenvs) return
          const values = Object.fromEntries(
            gitenvs.envStages.map((stage) => [
              stage.name,
              { value: '', encrypted: true },
            ]),
          )
          const newGitenvs = {
            ...gitenvs,
            envVars: [
              ...gitenvs.envVars,
              { id: getNewEnvVarId(), fileId, key: '', values },
            ],
          }
          await saveGitenvs({ gitenvs: newGitenvs })
          await trpcUtils.gitenvs.invalidate()
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
