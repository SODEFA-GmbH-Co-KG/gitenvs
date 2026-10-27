import { BACKUP_DIR_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { rerollPassphrases } from '@/gitenvs/rerollPassphrases'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { superAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

const rerollAction = (stageNames?: string[]) =>
  superAction(async () => {
    await rerollPassphrases({ stageNames })
    revalidatePath('/', 'layout')
    redirect('/setup/save?rerolled=1')
  })

export const RerollPassphrases = async () => {
  const gitenvs = await getGitenvs()

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <h1 className="text-center text-2xl">
        Are you sure you want to reroll your passphrases?
      </h1>
      <Alert variant={'destructive'}>
        <AlertTitle className="flex items-center gap-2">
          <TriangleAlert />
          Important Notice
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>
            This generates new passphrases for the selected stages and
            re-encrypts all their env vars. If any value cannot be re-encrypted,
            nothing is changed.
          </p>
          <p>
            Afterwards you have to replace the passphrases everywhere they are
            used (CI, hosting providers, password manager).
          </p>
          <p>
            The old <code className="font-bold">gitenvs.json</code> and
            passphrases are backed up to{' '}
            <code className="font-bold">{BACKUP_DIR_NAME}/</code> (added to
            .gitignore). Delete the backup once the new passphrases are
            deployed.
          </p>
          <p>
            Old passphrases can still decrypt{' '}
            <code className="font-bold">gitenvs.json</code> from your git
            history. If a passphrase leaked, rotate the secrets themselves as
            well.
          </p>
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <ActionButton
          action={async () => {
            'use server'
            return rerollAction()
          }}
        >
          Yes! Reroll all stages
        </ActionButton>
        <div className="flex flex-wrap gap-2">
          {gitenvs.envStages.map((stage) => (
            <ActionButton
              key={stage.name}
              variant={'outline'}
              className="flex-1"
              action={async () => {
                'use server'
                return rerollAction([stage.name])
              }}
            >
              Only {stage.name}
            </ActionButton>
          ))}
        </div>
      </div>
      <Link href="/">
        <Button variant={'outline'} className="w-full">
          <ArrowLeft />
          Nope! Nevermind
        </Button>
      </Link>
    </div>
  )
}
