'use client'

import { passphrasesAtom } from '@/passphrasesAtom'
import { useAtomValue } from 'jotai'
import { Rocket } from 'lucide-react'
import {
  useSuperAction,
  UseSuperActionOptions,
} from '~/super-action/action/useSuperAction'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import { encryptWithEncryptionToken } from '~/utils/encryptionToken'
import { Button } from './ui/button'

export const DeployToServiceButton = (
  options: UseSuperActionOptions<
    unknown,
    {
      encryptedPassphrase: {
        encryptedValue: string
        iv: string
      }
      stageName: string
    }[]
  >,
) => {
  const passphrases = useAtomValue(passphrasesAtom)
  const { trigger, isLoading } = useSuperAction({
    catchToast: true,
    ...options,
  })
  const getEncryptionKeyOnClient = useEncryptionKeyOnClient()

  return (
    <Button
      onClick={async () => {
        const key = await getEncryptionKeyOnClient()
        const encryptedPassphrases = await Promise.all(
          passphrases.map(async (passphrase) => {
            const encryptedPassphrase = await encryptWithEncryptionToken({
              plaintext: passphrase.passphrase,
              key,
            })
            return {
              stageName: passphrase.stageName,
              encryptedPassphrase,
            }
          }),
        )
        trigger(encryptedPassphrases)
      }}
      disabled={isLoading}
    >
      <div className="flex flex-row items-center gap-2">
        <Rocket className="size-4" />
        Deploy
      </div>
    </Button>
  )
}
