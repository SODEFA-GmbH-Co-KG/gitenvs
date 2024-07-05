import { cn } from '@/lib/utils'
import { filter } from 'lodash-es'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Fragment } from 'react'
import { saveGitenvs } from '~/gitenvs/gitenvs'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import {
  streamDialog,
  streamToast,
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
              hideButton
              command={{ label: `Delete ${envFile.name}`, group: 'Delete' }}
              action={async () => {
                'use server'

                return superAction(async () => {
                  const newEnvFiles = filter(
                    gitenvs.envFiles,
                    (file) => file.id !== envFile.id,
                  )
                  const newEnvVars = filter(
                    gitenvs.envVars,
                    (envVar) => envVar.fileId !== envFile.id,
                  )
                  await saveGitenvs({
                    ...gitenvs,
                    envFiles: newEnvFiles,
                    envVars: newEnvVars,
                  })

                  streamToast({
                    title: 'Env File Deleted',
                    description: `The env file ${envFile.name} has been deleted.`,
                  })
                })
              }}
            />
            <ActionButton
              variant="vanilla"
              size={'vanilla'}
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
