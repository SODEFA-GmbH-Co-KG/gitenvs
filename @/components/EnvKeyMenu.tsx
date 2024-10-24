import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { filter } from 'lodash-es'
import { MoreVertical } from 'lucide-react'
import { saveGitenvs } from '~/lib/gitenvs'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
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
}: {
  gitenvs: Gitenvs
  envVar: EnvVar
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
