import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Fragment } from 'react'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { KeyShortcut } from './KeyShortcut'
import { NewEnvFileDialog } from './NewEnvFileDialog'

export const EnvFileSwitcher = ({
  gitenvs,
  activeFileId,
}: {
  gitenvs: Gitenvs
  activeFileId: string
}) => {
  return (
    <div className="flex flex-row gap-4">
      {gitenvs.envFiles.map((envFile, index) => {
        return (
          <Fragment key={envFile.id}>
            <ActionButton
              variant="vanilla"
              size={'vanilla'}
              hideIcon
              action={async () => {
                'use server'
                return superAction(async () => {
                  redirect(`/file/${envFile.id}`)
                })
              }}
              className={cn(
                'flex h-7 flex-row items-center justify-center gap-2 rounded-full px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary',
                envFile.id === activeFileId && 'bg-muted text-primary',
              )}
              command={{
                shortcut: { key: `${index + 1}` },
                label: `Switch to ${envFile.name}`,
              }}
            >
              <span>{envFile.name}</span>
              <KeyShortcut>{index + 1}</KeyShortcut>
            </ActionButton>
          </Fragment>
        )
      })}
      <ActionButton
        variant="vanilla"
        size="vanilla"
        type="button"
        hideIcon
        className={cn(
          'flex h-7 flex-row items-center justify-center gap-2 rounded-full px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary',
        )}
        command={{ shortcut: { key: 'N' }, label: 'New Env File' }}
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'New Env File',
              content: <NewEnvFileDialog gitenvs={gitenvs} />,
            })
          })
        }}
      >
        <Plus />
        <span>New</span>
        <KeyShortcut>N</KeyShortcut>
      </ActionButton>
    </div>
  )
}
