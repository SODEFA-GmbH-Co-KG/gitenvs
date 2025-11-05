import { saveGitenvs } from '@/gitenvs/gitenvs'
import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { cloneDeep, filter, flatMap } from 'lodash-es'
import { ChevronDown, Pencil, Trash, Unlink } from 'lucide-react'
import { type ReactNode } from 'react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { streamRevalidatePath } from '~/super-action/action/streamRevalidatePath'
import { ActionButton } from '~/super-action/button/ActionButton'
import { ActionWrapper } from '~/super-action/button/ActionWrapper'
import { EditEnvKeyDialog } from './EditEnvKeyDialog'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const TableEnvKey = ({
  children,
  gitenvs,
  envVar,
  fileId,
}: {
  children: ReactNode
  gitenvs: Gitenvs
  envVar: EnvVar
  fileId: string
}) => {
  const rename = async () => {
    'use server'

    return superAction(async () => {
      streamDialog({
        content: <EditEnvKeyDialog envVar={envVar} gitenvs={gitenvs} />,
      })
    })
  }

  return (
    <div className="flex w-full flex-row">
      <ActionButton
        variant="ghost"
        autoFocus={envVar.key === ''}
        action={rename}
        className="flex flex-1 cursor-pointer flex-row justify-between gap-4 truncate rounded-none rounded-l-lg p-2 px-4"
      >
        {children}
      </ActionButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="shrink-0 rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
            size="icon"
            aria-label="Options"
            variant="ghost"
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent forceMount data-arrowtab="disable-down disable-up">
          <ActionWrapper action={rename}>
            <DropdownMenuItem className="flex items-center gap-2">
              <Pencil className="size-4" />
              <span>Rename</span>
            </DropdownMenuItem>
          </ActionWrapper>

          <ActionWrapper
            askForConfirmation={{
              title: `Delete Env "${envVar.key}"?`,
              confirm: 'Delete',
              cancel: 'Cancel',
            }}
            action={async () => {
              'use server'

              return superAction(async () => {
                const newGitenvs = {
                  ...gitenvs,
                  envVars: filter(gitenvs.envVars, (v) => v.id !== envVar.id),
                }
                await saveGitenvs(newGitenvs)
                streamRevalidatePath('/', 'layout')
                streamDialog(null)
              })
            }}
            command={{
              group: 'Delete',
              label: `Delete Env "${envVar.key}"`,
            }}
          >
            <DropdownMenuItem asChild>
              <div className="flex w-full flex-row items-center justify-start gap-2">
                <Trash className="size-4" />
                Delete
              </div>
            </DropdownMenuItem>
          </ActionWrapper>

          {envVar.fileIds.length > 1 && (
            <ActionWrapper
              action={async () => {
                'use server'

                return superAction(async () => {
                  const envVarsSplitted = flatMap(gitenvs.envVars, (ev) => {
                    if (ev.id !== envVar.id) return [ev]
                    const oldEnvVar = cloneDeep(ev)
                    const oldWithoutCurrentFileId = {
                      ...ev,
                      fileIds: filter(
                        ev.fileIds,
                        (evFileIds) => evFileIds !== fileId,
                      ),
                    }
                    const oldEnvVarAsNew = {
                      ...oldEnvVar,
                      id: getNewEnvVarId(),
                      fileIds: [fileId],
                    }
                    return [
                      oldEnvVarAsNew,
                      oldWithoutCurrentFileId,
                    ] satisfies EnvVar[]
                  })
                  await saveGitenvs({
                    ...gitenvs,
                    envVars: envVarsSplitted,
                  })
                  streamRevalidatePath('/', 'layout')
                  streamDialog(null)
                })
              }}
              command={{
                label: `Unlink Env "${envVar.key}"`,
              }}
            >
              <DropdownMenuItem className="flex w-full flex-row items-center justify-start gap-2">
                <Unlink className="size-4" />
                Unlink
              </DropdownMenuItem>
            </ActionWrapper>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
