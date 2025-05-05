import { createKeys } from '@/gitenvs/createKeys'
import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { getCwd } from '@/gitenvs/getCwd'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs, saveGitenvs } from '@/gitenvs/gitenvs'
import { type Passphrase } from '@/gitenvs/gitenvs.schema'
import { readFile, writeFile } from 'fs/promises'
import { every, map } from 'lodash-es'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { join } from 'path'
import { superAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'

export const RerollPassphrases = async () => {
  return (
    <div className="flex max-w-lg flex-col gap-8">
      <h1 className="text-center text-2xl">
        Are you sure you want to reroll your passphrases?
      </h1>
      <p>
        This will generate new passphrases for all your stages. You have to
        replace all env vars you have setup in online platforms.
      </p>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            const passphrasePath = join(getCwd(), PASSPHRASE_FILE_NAME)
            const currentFileContent = await readFile(passphrasePath, 'utf-8')
              .then((res) => JSON.parse(res) as Passphrase[])
              .catch(() => [])

            const gitenvs = await getGitenvs()

            const allGitenvStages = map(gitenvs.envStages, (es) => es.name)

            const allPassphrasesExists = every(allGitenvStages, (stage) => {
              const requestedPassphrase = currentFileContent.find(
                (p) => p.stageName === stage,
              )?.passphrase
              return !!requestedPassphrase
            })

            if (!allPassphrasesExists) {
              throw new Error(
                'You have to have all passphrases to start rerolling',
              )
            }

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

                const decryptPass = currentFileContent.find(
                  (p) => p.stageName === stageName,
                )!

                const currentStageEncryptedPrivateKey = gitenvs.envStages.find(
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

            // console.log({ newEnvVars, newStageEncryptionStates })

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
        Yes! Reroll
      </ActionButton>
    </div>
  )
}
