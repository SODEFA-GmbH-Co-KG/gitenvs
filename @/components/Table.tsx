'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import NiceModal from '@ebay/nice-modal-react'
import { Fragment, useEffect } from 'react'
import { saveGitenvs } from '~/gitenvs/gitenvs'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '~/gitenvs/idsGenerator'
import { EditEnvKeyDialog } from './EditEnvKeyDialog'
import { EditEnvVarDialog } from './EditEnvVarDialog'

export const Table = ({
  fileId,
  gitenvs,
}: {
  fileId: string
  gitenvs: Gitenvs
}) => {
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
    <div className="flex flex-col gap-2 rounded-md border p-4">
      {!!gitenvs?.envVars.length ? (
        <div
          className="grid gap-2"
          id="supergrid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          <div></div>
          {gitenvs?.envStages.map((stage) => (
            <div key={stage.name} className="flex flex-col gap-2">
              {stage.name}
            </div>
          ))}
          <div className="p-1">Passphrase</div>
          {gitenvs?.envStages.map((stage) => (
            <Input
              key={stage.name}
              className="flex flex-col gap-2"
              autoComplete="new-password"
              type="password"
            ></Input>
          ))}
          <div className="p-1">Key</div>
          {gitenvs?.envStages.map((stage) => (
            <div key={stage.name} className="flex flex-col gap-2">
              {stage.name}
            </div>
          ))}
          {gitenvs?.envVars.map((envVar, index) => {
            if (envVar.fileId !== fileId) return null
            const handler = async () => {
              const activeElement = document.activeElement
              try {
                await NiceModal.show(EditEnvKeyDialog, {
                  envVar,
                  gitenvs,
                })
              } finally {
                setTimeout(() => {
                  if (activeElement instanceof HTMLElement) {
                    activeElement.focus()
                  }
                }, 200)
              }
            }
            return (
              <Fragment key={index}>
                <div
                  tabIndex={0}
                  onClick={handler}
                  onKeyDown={async (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      await handler()
                    }
                  }}
                  className="cursor-pointer p-1"
                >
                  {envVar.key}
                </div>

                {gitenvs?.envStages.map((stage) => {
                  const handler = async () => {
                    const activeElement = document.activeElement
                    try {
                      await NiceModal.show(EditEnvVarDialog, {
                        envVar,
                        envStage: stage,
                        gitenvs,
                      })
                    } finally {
                      setTimeout(() => {
                        if (activeElement instanceof HTMLElement) {
                          activeElement.focus()
                        }
                      }, 200)
                    }
                  }
                  return (
                    <div
                      key={`${envVar.key}-${stage.name}`}
                      tabIndex={0}
                      onClick={handler}
                      onKeyDown={(event) => event.key === 'Enter' && handler()}
                      className="flex cursor-pointer items-center p-1"
                    >
                      {envVar.values[stage.name]?.encrypted ? (
                        <span className="rounded-sm bg-gray-600 p-1 text-xs uppercase">
                          Encrypted
                        </span>
                      ) : (
                        envVar.values[stage.name]?.value
                      )}
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
          await saveGitenvs(newGitenvs)
        }}
      >
        Add
      </Button>
    </div>
  )
}
