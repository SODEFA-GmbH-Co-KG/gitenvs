import {
  getIsGitenvsInGitIgnore,
  getIsGitignoreExisting,
  updateGitIgnore,
} from '@/gitenvs/gitignore'
import { getIsGitenvsInstalled, installGitenvs } from '@/gitenvs/installGitenvs'
import { cn } from '@/lib/utils'
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate'
import { redirect } from 'next/navigation'
import { ActionButton } from '~/super-action/button/ActionButton'

export default async function Page() {
  const [isGitignoreExisting, isGitenvsInGitIgnore, isGitenvsInstalled] =
    await Promise.all([
      getIsGitignoreExisting(),
      getIsGitenvsInGitIgnore(),
      getIsGitenvsInstalled(),
    ])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your project</h1>

      <p className="text-center">
        Here are some last steps to configure your project.
      </p>

      <div className="grid grid-cols-[3fr_1fr] items-center gap-8">
        <p className={cn(isGitenvsInGitIgnore && 'text-gray-500 line-through')}>
          To protect your passphrases add <code>*.gitenvs.passphrase</code> to
          your <code>.gitignore</code> file.
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            await updateGitIgnore()
            revalidatePath('/')
          }}
          disabled={isGitenvsInGitIgnore}
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
            await installGitenvs()
            revalidatePath('/')
          }}
          disabled={isGitenvsInstalled}
          className={cn(isGitenvsInstalled && 'line-through')}
        >
          Install Gitenvs
        </ActionButton>
      </div>

      <div className="flex justify-end">
        <ActionButton
          action={async () => {
            'use server'
            redirect('/')
          }}
          variant={isGitenvsInGitIgnore ? 'default' : 'outline'}
          className="self-end"
        >
          Next
        </ActionButton>
      </div>
    </div>
  )
}