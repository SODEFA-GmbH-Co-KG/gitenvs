import { Hr } from '@/components/Hr'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import {
  getIsGitenvsInGitIgnore,
  getIsGitignoreExisting,
  updateGitIgnore,
} from '@/gitenvs/gitignore'
import { getIsGitenvsInstalled, installGitenvs } from '@/gitenvs/installGitenvs'
import { addToScripts, getIsAddedToScripts } from '@/gitenvs/packageJsonScripts'
import {
  getIsPostInstallScriptExisting,
  updatePostInstall,
} from '@/gitenvs/postinstall'
import { cn } from '@/lib/utils'
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate'
import { redirect } from 'next/navigation'
import { superAction } from '~/super-action/action/createSuperAction'
import { streamRevalidatePath } from '~/super-action/action/streamRevalidatePath'
import { ActionButton } from '~/super-action/button/ActionButton'

export default async function Page() {
  const [
    isGitignoreExisting,
    isGitenvsInGitIgnore,
    isGitenvsInstalled,
    isPostInstallScriptExisting,
    isAddedToScripts,
  ] = await Promise.all([
    getIsGitignoreExisting(),
    getIsGitenvsInGitIgnore(),
    getIsGitenvsInstalled(),
    getIsPostInstallScriptExisting(),
    getIsAddedToScripts(),
  ])

  const allDone =
    isGitignoreExisting && isGitenvsInstalled && isPostInstallScriptExisting

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your project</h1>

      <p className="text-center">
        Here are some last steps to configure your project.
      </p>

      <div className="grid grid-cols-[3fr_1fr] items-center gap-8">
        <p className={cn(isGitenvsInGitIgnore && 'text-gray-500 line-through')}>
          To protect your passphrases add <code>{PASSPHRASE_FILE_NAME}</code> to
          your <code>.gitignore</code> file.
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            return superAction(async () => {
              await updateGitIgnore()
              revalidatePath('/setup/project')
            })
          }}
          disabled={isGitenvsInGitIgnore}
          variant="outline"
          className={cn(isGitenvsInGitIgnore && 'line-through')}
        >
          {isGitignoreExisting ? 'Edit .gitignore' : 'Create .gitignore'}
        </ActionButton>

        <p className={cn(isGitenvsInstalled && 'text-gray-500 line-through')}>
          Install gitenvs as a dev dependency.
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            return superAction(async () => {
              await installGitenvs()
              revalidatePath('/setup/project')
            })
          }}
          disabled={isGitenvsInstalled}
          variant="outline"
          className={cn(isGitenvsInstalled && 'line-through')}
        >
          Install Gitenvs
        </ActionButton>

        <p
          className={cn(
            isPostInstallScriptExisting && 'text-gray-500 line-through',
          )}
        >
          Add a postinstall script to your <code>package.json</code> file to
          create your env files.
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            return superAction(async () => {
              await updatePostInstall()
              revalidatePath('/setup/project')
            })
          }}
          disabled={isPostInstallScriptExisting}
          variant="outline"
          className={cn(isPostInstallScriptExisting && 'line-through')}
        >
          Add postinstall
        </ActionButton>

        <p className={cn(isAddedToScripts && 'text-gray-500 line-through')}>
          Add gitenvs to your <code>package.json</code> scripts.
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            return superAction(async () => {
              await addToScripts()
              revalidatePath('/setup/project')
            })
          }}
          disabled={isAddedToScripts}
          variant="outline"
          className={cn(isAddedToScripts && 'line-through')}
        >
          Add to scripts
        </ActionButton>

        <Hr outerClassName="col-span-full" thin marginX>
          or
        </Hr>

        <p className={cn(allDone && 'text-gray-500 line-through')}>
          Push all the buttons
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            return superAction(async () => {
              await updateGitIgnore()
              streamRevalidatePath('/setup/project')
              await installGitenvs() // installGitenvs & updatePostInstall both change package.json. So one needs to be run first. FIXME: We run install first because adding the postinstall script breaks the GITENVS_DIR stuff.
              streamRevalidatePath('/setup/project')
              await updatePostInstall()
              streamRevalidatePath('/setup/project')
              await addToScripts()
              streamRevalidatePath('/setup/project')
            })
          }}
          disabled={allDone}
          variant={allDone ? 'outline' : 'default'}
          className={cn(allDone && 'line-through')}
        >
          Run everything
        </ActionButton>
      </div>

      <div className="flex justify-end">
        <ActionButton
          action={async () => {
            'use server'
            redirect('/')
          }}
          variant={allDone ? 'default' : 'outline'}
          className="self-end"
        >
          Next
        </ActionButton>
      </div>
    </div>
  )
}
