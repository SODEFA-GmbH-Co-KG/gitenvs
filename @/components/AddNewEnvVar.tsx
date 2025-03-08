import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { ChevronDown, Import, Link, Plus } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionWrapper } from '~/super-action/button/ActionWrapper'
import { AddEnvVarDialog } from './AddEnvVarDialog'
import { KeyShortcut } from './KeyShortcut'
import { LinkEnvVarDialog } from './LinkEnvVarDialog'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const AddEnvVarFormSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
  encrypt: z.boolean(),
  isFunction: z.boolean(),
})

export type AddEnvVarFormData = z.infer<typeof AddEnvVarFormSchema>

export const AddNewEnvVar = async ({
  fileId,
  gitenvs,
}: {
  fileId: string
  gitenvs: Gitenvs
}) => {
  const amountOfFiles = gitenvs.envFiles.length
  return (
    <>
      <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
        <ActionWrapper
          command={{
            shortcut: {
              key: 'a',
            },
            label: 'Add new env var',
          }}
          action={async () => {
            'use server'

            return superAction(async () => {
              streamDialog({
                title: `Add new env var`,
                content: (
                  <AddEnvVarDialog
                    fileId={fileId}
                    gitenvs={gitenvs}
                    onAfterSave={async () => {
                      'use server'

                      return superAction(async () => {
                        streamDialog(null)
                        revalidatePath('/', 'layout')
                      })
                    }}
                  />
                ),
              })
            })
          }}
        >
          <Button className="flex items-center gap-2 overflow-hidden rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10">
            <Plus
              className="opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="flex-1 truncate">Add New EnvVar</span>
            <KeyShortcut>a</KeyShortcut>
          </Button>
        </ActionWrapper>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="shrink-0 rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              size="icon"
              aria-label="Options"
            >
              <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-arrowtab="disable-down disable-up">
            <ActionWrapper
              action={async () => {
                'use server'

                return superAction(async () => {
                  streamDialog({
                    title: `Link existing env var`,
                    content: (
                      <LinkEnvVarDialog gitenvs={gitenvs} fileId={fileId} />
                    ),
                  })
                })
              }}
            >
              {amountOfFiles <= 1 ? (
                <Tooltip>
                  <TooltipTrigger>
                    <DropdownMenuItem disabled>
                      <Link className="mr-2 h-4 w-4 shrink-0" /> Link existing
                      env var
                    </DropdownMenuItem>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>
                      To link an existing env var to this file, you have to
                      create an env var in another file first.
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenuItem>
                  <Link className="mr-2 h-4 w-4 shrink-0" /> Link existing env
                  var
                </DropdownMenuItem>
              )}
            </ActionWrapper>
            <ActionWrapper
              action={async () => {
                'use server'

                return superAction(async () => {
                  redirect(`/setup/import?fileId=${fileId}`)
                })
              }}
            >
              <DropdownMenuItem>
                <Import className="mr-2 h-4 w-4 shrink-0" /> Import from file /
                vercel
              </DropdownMenuItem>
            </ActionWrapper>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div></div>
      <div></div>
      <div></div>
    </>
  )
}
