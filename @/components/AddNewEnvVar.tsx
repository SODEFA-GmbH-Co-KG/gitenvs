import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { ChevronDown, Import, Link, Plus } from 'lucide-react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionWrapper } from '~/super-action/button/ActionWrapper'
import { AddEnvVarDialog } from './AddEnvVarDialog'
import { LinkEnvVarDialog } from './LinkEnvVarDialog'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { saveGitenvs } from '@/gitenvs/gitenvs'
import { type EnvVar } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { map } from 'lodash-es'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { KeyShortcut } from './KeyShortcut'

export const AddEnvVarFormSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
  encrypt: z.boolean(),
})

export type AddEnvVarFormData = z.infer<typeof AddEnvVarFormSchema>

export const AddNewEnvVar = async ({
  fileId,
  gitenvs,
}: {
  fileId: string
  gitenvs: Gitenvs
}) => {
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
                    saveAction={async (formData: AddEnvVarFormData) => {
                      'use server'

                      return superAction(async () => {
                        const envStages = gitenvs.envStages
                        const newEnVar = {
                          id: getNewEnvVarId(),
                          key: formData.key,
                          values: Object.fromEntries(
                            await Promise.all(
                              map(envStages, async (es) => {
                                return [
                                  es.name,
                                  {
                                    value: formData.encrypt
                                      ? await encryptEnvVar({
                                          plaintext: formData.value,
                                          publicKey: es.publicKey,
                                        })
                                      : formData.value,
                                    encrypted: formData.encrypt,
                                  },
                                ]
                              }),
                            ),
                          ),
                          fileIds: [fileId],
                        } satisfies EnvVar

                        await saveGitenvs({
                          ...gitenvs,
                          envVars: [...gitenvs.envVars, newEnVar],
                        })

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
          <DropdownMenuContent>
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
              <DropdownMenuItem>
                <Link className="mr-2 h-4 w-4 shrink-0" /> Link existing env var
              </DropdownMenuItem>
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
