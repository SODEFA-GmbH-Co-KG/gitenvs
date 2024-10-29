'use client'

import { type EnvStage } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import { map } from 'lodash-es'
import { Eye, EyeClosed, ShieldEllipsis } from 'lucide-react'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const EnvVarsStageHeader = ({ stage }: { stage: EnvStage }) => {
  const [stageEncryptionStates, setStageEncryptionState] = useAtom(
    stageEncryptionStateAtom,
  )

  const stageEncryptionState = stageEncryptionStates?.find(
    (s) => s.stageName === stage.name,
  )

  return (
    <>
      <Button
        variant={'ghost'}
        key={stage.name}
        className={cn('flex flex-1 items-center gap-x-2')}
        onClick={() => {
          if (!!stageEncryptionState?.decryptionKey) {
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
            const passphrase = prompt('Enter passphrase')
            setStageEncryptionState((prev) => {
              const newState = map(prev, (s) => {
                if (s.stageName === stage.name) {
                  return {
                    ...s,
                    decryptionKey: passphrase,
                  }
                }
                return s
              })
              return newState
            })
          }
        }}
      >
        <div className="flex items-center">
          {!!stageEncryptionState?.decryptionKey ? (
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
        {!!stageEncryptionState?.decryptionKey && (
          <div>
            {stageEncryptionState?.showValues ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeClosed className="h-4 w-4" />
            )}
          </div>
        )}
      </Button>
    </>
  )
}
