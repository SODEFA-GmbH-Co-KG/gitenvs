import { getPassphraseEnvName } from '@/gitenvs/env'
import { BACKUP_DIR_NAME, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getRerollStatus, rerollPassphrases } from '@/gitenvs/rerollPassphrases'
import { TriangleAlert } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  streamToast,
  superAction,
} from '~/super-action/action/createSuperAction'
import { decryptWithEncryptionKey } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'
import {
  RerollPassphrasesForm,
  type RerollInput,
} from './RerollPassphrasesForm'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export const RerollPassphrases = async () => {
  const stages = await getRerollStatus()

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-center text-2xl">Reroll your passphrases</h1>
      <Alert variant={'destructive'}>
        <AlertTitle className="flex items-center gap-2">
          <TriangleAlert />
          Important Notice
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>
            This generates new passphrases for the selected stages and
            re-encrypts all their env vars. If any value cannot be re-encrypted,
            nothing is changed. Use the dry run to check first.
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
      <RerollPassphrasesForm
        stages={stages}
        passphraseFileName={PASSPHRASE_FILE_NAME}
        action={async (input: RerollInput) => {
          'use server'
          return superAction(async () => {
            const key = await getEncryptionKeyOnServer()
            const passphrases = await Promise.all(
              input.encryptedPassphrases.map(async (p) => ({
                stageName: p.stageName,
                passphrase: await decryptWithEncryptionKey({
                  ...p.encryptedPassphrase,
                  key,
                }),
              })),
            )

            const result = await rerollPassphrases({
              stageNames: input.stageNames,
              passphrases,
              passphraseSources: input.passphraseSources,
              dryRun: input.dryRun,
            })

            if (result.dryRun) {
              streamToast({
                title: 'Dry run passed ✅',
                description: `Rerolling ${result.stages.join(', ')} would re-encrypt ${result.reencryptedValues} ${result.reencryptedValues === 1 ? 'value' : 'values'}. Nothing was changed.`,
              })
              return
            }

            // env vars take precedence over the passphrase file, so the UI
            // would keep showing the old passphrases
            for (const p of result.newPassphrases) {
              const envName = getPassphraseEnvName({ stage: p.stageName })
              if (process.env[envName]) process.env[envName] = p.passphrase
            }

            revalidatePath('/', 'layout')
            const params = new URLSearchParams({
              rerolled: result.stages.join(','),
            })
            if (result.staleEnvNames.length) {
              params.set('staleEnv', result.staleEnvNames.join(','))
            }
            redirect(`/setup/save?${params.toString()}`)
          })
        }}
      />
    </div>
  )
}
