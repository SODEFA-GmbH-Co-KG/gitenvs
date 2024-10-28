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
}: {
  children: ReactNode
  gitenvs: Gitenvs
  envVar: EnvVar
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
                dropdown={<EnvKeyMenu gitenvs={gitenvs} envVar={envVar} />}
              />
            ),
          })
        })
      }}
      className="flex cursor-pointer flex-row justify-between gap-4 p-1"
    >
      {children}
    </ActionButton>
  )
}
