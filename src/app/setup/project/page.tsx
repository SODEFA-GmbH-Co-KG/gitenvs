import { updateGitIgnore } from '@/gitenvs/gitignore'
import { redirect } from 'next/navigation'
import { ActionButton } from '~/super-action/button/ActionButton'

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your project</h1>

      <p className="text-center">
        Here are some last steps to configure your project.
      </p>

      <div className="grid grid-cols-[3fr_1fr] items-center gap-8">
        <p>
          To protect your passphrases add <code>*.gitenvs.passphrase</code> to
          your <code>.gitignore</code> file.
        </p>
        <ActionButton
          hideIcon={false}
          action={async () => {
            'use server'
            await updateGitIgnore()
          }}
        >
          Edit .gitignore
        </ActionButton>
      </div>

      <ActionButton
        action={async () => {
          'use server'
          redirect('/')
        }}
        className="self-end"
      >
        Done
      </ActionButton>
    </div>
  )
}
