'use client'

import { type EnvStage, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import NiceModal from '@ebay/nice-modal-react'
import { useAtom } from 'jotai'
import { filter, map } from 'lodash-es'
import { ChevronDown, Eye, EyeOff, ShieldEllipsis, Trash } from 'lucide-react'
import { saveGitenvs } from '~/lib/gitenvs'
import { ActionWrapper } from '~/super-action/button/ActionWrapper'
import { AddPassphraseDialog } from './AddPassphraseDialog'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const EnvVarsStageHeader = ({
  stage,
  gitenvs,
}: {
  stage: EnvStage
  gitenvs: Gitenvs
}) => {
  const [stageEncryptionStates, setStageEncryptionState] = useAtom(
    stageEncryptionStateAtom,
  )

  const stageEncryptionState = stageEncryptionStates?.find(
    (s) => s.stageName === stage.name,
  )

  return (
    <>
      <div className="flex w-full flex-row">
        <Button
          variant={'ghost'}
          key={stage.name}
          className={cn(
            'flex flex-1 items-center gap-x-2 rounded-l-lg rounded-r-none',
          )}
          onClick={async () => {
            if (!!stageEncryptionState?.passphrase) {
              setStageEncryptionState((prev) => {
                const newState = map(prev, (s) => {
                  if (s.stageName === stage.name) {
                    return {
                      ...s,
                      showValues: !s.showValues,
                    }
                  }
                  return s
                })
                return newState
              })
            } else {
              await NiceModal.show(AddPassphraseDialog, {
                stage,
              })
            }
          }}
        >
          <div className="flex items-center">
            {!!stageEncryptionState?.passphrase ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldEllipsis className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  Passphrase provided - ready to decrypt
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldEllipsis className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  No passphrase provided - click to add one
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex flex-1">{stage.name}</div>
          {!!stageEncryptionState?.passphrase && (
            <div>
              {stageEncryptionState?.showValues ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </div>
          )}
        </Button>
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
          <DropdownMenuContent data-arrowtab="disable-down disable-up">
            <ActionWrapper
              askForConfirmation={{
                title: `Delete Stage "${stage.name}"?`,
                confirm: 'Delete',
                cancel: 'Cancel',
              }}
              action={async () => {
                gitenvs.envStages = filter(
                  gitenvs.envStages,
                  (s) => s.name !== stage.name,
                )
                gitenvs.envVars = map(gitenvs.envVars, (v) => {
                  delete v.values[stage.name]
                  return v
                })
                await saveGitenvs(gitenvs)
              }}
            >
              <DropdownMenuItem className="flex items-center gap-2">
                <Trash className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </ActionWrapper>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
