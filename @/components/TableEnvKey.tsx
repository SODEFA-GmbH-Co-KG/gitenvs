import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { type ReactNode } from 'react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { EditEnvKeyDialog } from './EditEnvKeyDialog'
import { EnvKeyMenu } from './EnvKeyMenu'

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
  return (
    <ActionButton
      variant="ghost"
      autoFocus={envVar.key === ''}
      action={async () => {
        'use server'

        return superAction(async () => {
          streamDialog({
            content: (
              <EditEnvKeyDialog
                envVar={envVar}
                gitenvs={gitenvs}
                dropdown={
                  <EnvKeyMenu
                    gitenvs={gitenvs}
                    envVar={envVar}
                    fileId={fileId}
                  />
                }
              />
            ),
          })
        })
      }}
      className="sticky left-0 z-10 flex cursor-pointer flex-row justify-between gap-4 bg-background p-1"
    >
      {children}
    </ActionButton>
  )
}
