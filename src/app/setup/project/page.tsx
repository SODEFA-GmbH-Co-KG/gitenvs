import { Hr } from '@/components/Hr'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { getGitenvs } from '@/gitenvs/gitenvs'
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
import { AlertTriangleIcon } from 'lucide-react'
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
    gitenvs,
    { foundPackageJson },
  ] = await Promise.all([
    getIsGitignoreExisting(),
    getIsGitenvsInGitIgnore(),
    getIsGitenvsInstalled(),
    getIsPostInstallScriptExisting(),
    getIsAddedToScripts(),
    getGitenvs(),
    getProjectRoot(),
  ])

  const firstFileId = gitenvs.envFiles[0]!.id

  const allDone =
    isGitignoreExisting &&
    isGitenvsInstalled &&
    isPostInstallScriptExisting &&
    isAddedToScripts

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your project</h1>

      <p className="text-center">
        Here are some last steps to configure your project.
      </p>
      {!foundPackageJson && (
        <div className="flex flex-1 justify-center">
          <Alert className="max-w-xl">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle className="">No package.json file found</AlertTitle>
            <AlertDescription>
              We couldn&apos;t find a <code>package.json</code> file in your
              project. The following steps will be skipped.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <ActionButton
        hideIcon={false}
        action={async () => {
          'use server'
          return superAction(async () => {
            if (!isGitignoreExisting || !isGitenvsInstalled) {
              await updateGitIgnore()
              streamRevalidatePath('/setup/project')
            }

            if (!isGitenvsInstalled) {
              await installGitenvs() // installGitenvs & updatePostInstall both change package.json. So one needs to be run first. FIXME: We run install first because adding the postinstall script breaks the GITENVS_DIR stuff.
              streamRevalidatePath('/setup/project')
            }

            if (!isPostInstallScriptExisting) {
              await updatePostInstall()
              streamRevalidatePath('/setup/project')
            }

            if (!isAddedToScripts) {
              await addToScripts()
              streamRevalidatePath('/setup/project')
            }
          })
        }}
        disabled={allDone}
        variant={allDone ? 'outline' : 'default'}
        className={cn(allDone && 'line-through')}
      >
        Push all the buttons
      </ActionButton>

      <Hr outerClassName="col-span-full" thin marginX>
        or
      </Hr>

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
      </div>

      <div className="flex justify-end">
        <ActionButton
          action={async () => {
            'use server'
            redirect(
              `/setup/import?${new URLSearchParams({ fileId: firstFileId }).toString()}`,
            )
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
