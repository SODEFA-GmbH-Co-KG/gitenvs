import { getAllPassphrasesOrThrow } from '@/gitenvs/checkAllPassphrasesExist'
import { createKeys } from '@/gitenvs/createKeys'
import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { getCwd } from '@/gitenvs/getCwd'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { saveGitenvs } from '@/gitenvs/gitenvs'
import { writeFile } from 'fs/promises'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { join } from 'path'
import { superAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

export const RerollPassphrases = async () => {
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
        <AlertDescription>
          This will generate new passphrases for all your stages. All env vars
          are re-encrypted with these new passphrases.
          <br />
          <br />
          You have to replace all passphrases you have currently setup in online
          platforms in order for them to decrypt these new values.
          <br />
          <br />
          This action is irreversible. Please make a backup of your{' '}
          <code className="font-bold">gitenvs.json</code> and{' '}
          <code className="font-bold">gitenvs.passphrases.json</code> file in
          case of unexpected issues during rerolling process.
        </AlertDescription>
      </Alert>
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant={'outline'}>
            <ArrowLeft />
            Nope! Nevermind
          </Button>
        </Link>

        <ActionButton
          action={async () => {
            'use server'
            return superAction(async () => {
              const { passphrases, gitenvs } = await getAllPassphrasesOrThrow()

              const newStageEncryptionStates = await Promise.all(
                gitenvs.envStages.map(async (s) => {
                  const newKeys = await createKeys()
                  return { stageName: s, ...newKeys }
                }),
              )

              const newEnvVars = []
              //encrypt/decrypt all env vars
              for (const envVar of gitenvs.envVars) {
                const newEnvVar = {
                  ...envVar,
                }
                for (const stageName in envVar.values) {
                  if (!envVar.values.hasOwnProperty(stageName)) continue
                  const value = envVar.values[stageName]
                  if (!value) {
                    console.error(
                      `❌ Gitenvs: No value found for stage "${stageName}"`,
                    )
                    continue
                  }
                  if (!value.encrypted) {
                    // console.error(`❌ Gitenvs: Env var "${envVar.key}" is not encrypted`)
                    continue
                  }

                  const newStageEncryptionState = newStageEncryptionStates.find(
                    (s) => s.stageName.name === stageName,
                  )
                  if (!newStageEncryptionState) {
                    console.error(
                      `❌ Gitenvs: No passphrase found for stage "${stageName}"`,
                    )
                    continue
                  }

                  const decryptPass = passphrases.find(
                    (p) => p.stageName === stageName,
                  )!

                  const currentStageEncryptedPrivateKey =
                    gitenvs.envStages.find(
                      (s) => s.name === stageName,
                    )?.encryptedPrivateKey

                  if (!currentStageEncryptedPrivateKey) {
                    console.error(
                      `❌ Gitenvs: No encrypted private key found for stage "${stageName}"`,
                    )
                    continue
                  }
                  const decryptedValue = await decryptEnvVar({
                    encrypted: value.value,
                    encryptedPrivateKey: currentStageEncryptedPrivateKey,
                    passphrase: decryptPass.passphrase,
                  })

                  if (!decryptedValue) {
                    console.error(
                      `❌ Gitenvs: Error decrypting env var "${envVar.key}"`,
                    )
                    continue
                  }

                  const newEncryptedValue = await encryptEnvVar({
                    plaintext: decryptedValue,
                    publicKey: newStageEncryptionState.publicKey,
                  })

                  newEnvVar.values[stageName] = {
                    ...value,
                    value: newEncryptedValue,
                    encrypted: true,
                  }
                }
                newEnvVars.push(newEnvVar)
              }

              await saveGitenvs({
                ...gitenvs,
                envVars: newEnvVars,
                envStages: newStageEncryptionStates.map((s) => ({
                  name: s.stageName.name,
                  encryptedPrivateKey: s.encryptedPrivateKey,
                  publicKey: s.publicKey,
                })),
              })

              const path = join(getCwd(), PASSPHRASE_FILE_NAME)

              const passPhrasesFileContent = newStageEncryptionStates.map(
                (s) => ({
                  stageName: s.stageName.name,
                  passphrase: s.passphrase,
                }),
              )

              await writeFile(
                path,
                JSON.stringify(passPhrasesFileContent, null, 2),
              )
              revalidatePath('/', 'layout')
              return redirect('/setup/save')
            })
          }}
        >
          Yes! Let&apos;s Reroll
        </ActionButton>
      </div>
    </div>
  )
}
