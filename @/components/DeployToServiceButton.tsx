'use client'

import { passphrasesAtom } from '@/passphrasesAtom'
import { useAtomValue } from 'jotai'
import { Rocket } from 'lucide-react'
import { type UseSuperActionOptions } from '~/super-action/action/useSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import { encryptWithEncryptionToken } from '~/utils/encryptionToken'

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
  const getEncryptionKeyOnClient = useEncryptionKeyOnClient()

  return (
    <ActionButton
      {...options}
      hideIcon={false}
      action={async () => {
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
        return options.action(encryptedPassphrases)
      }}
      icon={<Rocket />}
    >
      Deploy
    </ActionButton>
  )
}
