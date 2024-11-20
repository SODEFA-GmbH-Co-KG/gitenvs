import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { cloneDeep, filter, flatMap } from 'lodash-es'
import { MoreVertical } from 'lucide-react'
import { saveGitenvs } from '~/lib/gitenvs'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { streamRevalidatePath } from '~/super-action/action/streamRevalidatePath'
import { ActionButton } from '~/super-action/button/ActionButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const EnvKeyMenu = ({
  gitenvs,
  envVar,
  fileId,
}: {
  gitenvs: Gitenvs
  envVar: EnvVar
  fileId: string
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent forceMount>
        <DropdownMenuItem asChild>
          <ActionButton
            variant="vanilla"
            size="vanilla"
            stopPropagation
            className="w-full justify-start"
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
            Delete
          </ActionButton>
        </DropdownMenuItem>
        {envVar.fileIds.length > 1 && (
          <DropdownMenuItem asChild>
            <ActionButton
              variant="vanilla"
              size="vanilla"
              stopPropagation
              className="w-full justify-start"
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
                  await saveGitenvs({ ...gitenvs, envVars: envVarsSplitted })
                  streamRevalidatePath('/', 'layout')
                  streamDialog(null)
                })
              }}
              command={{
                label: `Unlink Env "${envVar.key}"`,
              }}
            >
              Unlink
            </ActionButton>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
