import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { filter } from 'lodash-es'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Fragment } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'
import {
  streamDialog,
  streamToast,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { ActionWrapper } from '~/super-action/button/ActionWrapper'
import { AddEditEnvFileDialog } from './AddEditEnvFileDialog'
import { FileTypeDotenv } from './icons/env'
import { FileTypeTypescriptOfficial } from './icons/ts'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const EnvFileSwitcher = ({
  gitenvs,
  activeFileId,
}: {
  gitenvs: Gitenvs
  activeFileId?: string
}) => {
  return (
    <div className="flex max-w-full flex-row flex-wrap gap-4">
      {gitenvs.envFiles.map((envFile, index) => {
        const isActive = envFile.id === activeFileId
        return (
          <Fragment key={envFile.id}>
            <div
              className={cn(
                'group inline-flex max-w-60 ',
                isActive && 'rounded-lg border',
              )}
            >
              <ActionButton
                variant={'ghost'}
                // size={'vanilla'}
                action={async () => {
                  'use server'
                  return superAction(async () => {
                    redirect(`/file/${envFile.id}`)
                  })
                }}
                className={cn(
                  'overflow-hidden rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10',
                  // envFile.id !== activeFileId && 'bg-muted text-primary',
                )}
                command={{
                  shortcut: { key: `${index + 1}` },
                  label: `Switch to ${envFile.name}`,
                }}
              >
                {/* <GitFork
                  className="me-2 opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                /> */}
                <div className="shrink-0">
                  {envFile.type === '.ts' && (
                    <FileTypeTypescriptOfficial
                      className={cn(
                        'me-2 h-4 w-4 opacity-60 group-hover:grayscale-0',
                        !isActive && 'grayscale',
                      )}
                    />
                  )}
                  {envFile.type === 'dotenv' && (
                    <FileTypeDotenv
                      className={cn(
                        'me-2 h-4 w-4 opacity-60 group-hover:grayscale-0',
                        !isActive && 'grayscale',
                      )}
                    />
                  )}
                </div>
                <div className="truncate">{envFile.name}</div>
              </ActionButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={'ghost'}
                    className={cn(
                      'shrink-0 rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10',
                      // envFile.id !== activeFileId && 'bg-muted text-primary',
                    )}
                    size="icon"
                    aria-label="Options"
                  >
                    <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <ActionWrapper
                    command={{
                      label: `Edit EnvFile: ${envFile.name}`,
                      group: 'Edit',
                    }}
                    action={async () => {
                      'use server'
                      return superAction(async () => {
                        streamDialog({
                          title: `Edit Env File: ${envFile.name}`,
                          content: (
                            <AddEditEnvFileDialog
                              gitenvs={gitenvs}
                              envFile={envFile}
                            />
                          ),
                        })
                      })
                    }}
                  >
                    <DropdownMenuItem>
                      <div className="flex flex-row items-center gap-2">
                        <Pencil size={16} strokeWidth={2} aria-hidden="true" />
                        <span>Edit</span>
                      </div>
                    </DropdownMenuItem>
                  </ActionWrapper>
                  <ActionWrapper
                    command={{
                      label: `Delete EnvFile "${envFile.name}"`,
                      group: 'Delete',
                    }}
                    askForConfirmation={{
                      title: `Delete EnvFile "${envFile.name}"?`,
                      confirm: 'Delete',
                      cancel: 'Cancel',
                    }}
                    action={async () => {
                      'use server'

                      return superAction(async () => {
                        const newEnvFiles = filter(
                          gitenvs.envFiles,
                          (file) => file.id !== envFile.id,
                        )
                        const newEnvVars = filter(
                          gitenvs.envVars,
                          (envVar) => !envVar.fileIds.includes(envFile.id),
                        )
                        await saveGitenvs({
                          ...gitenvs,
                          envFiles: newEnvFiles,
                          envVars: newEnvVars,
                        })

                        streamToast({
                          title: `${envFile.name} deleted`,
                          description: `The env file ${envFile.name} has been deleted.`,
                        })
                      })
                    }}
                  >
                    <DropdownMenuItem>
                      <div className="flex flex-row items-center gap-2">
                        <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                        <span>Delete</span>
                      </div>
                    </DropdownMenuItem>
                  </ActionWrapper>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Fragment>
        )
      })}
      <ActionButton
        variant="ghost"
        size="vanilla"
        type="button"
        hideIcon
        className={cn(
          'flex flex-row items-center justify-center gap-2 px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary',
        )}
        command={{ shortcut: { key: 'N' }, label: 'New Env File' }}
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'New Env File',
              content: <AddEditEnvFileDialog gitenvs={gitenvs} />,
            })
          })
        }}
      >
        <Plus />
        <span>New</span>
      </ActionButton>
    </div>
  )
}
