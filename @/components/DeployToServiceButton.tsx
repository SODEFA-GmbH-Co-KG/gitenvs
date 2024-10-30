'use client'

import { useAtomValue } from 'jotai'
import { filter, map } from 'lodash-es'
import { Rocket } from 'lucide-react'
import { type UseSuperActionOptions } from '~/super-action/action/useSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import { encryptWithEncryptionKey } from '~/utils/encryptionToken'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'

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
  const stageEncryptionState = useAtomValue(stageEncryptionStateAtom)
  const getEncryptionKeyOnClient = useEncryptionKeyOnClient()

  return (
    <ActionButton
      {...options}
      hideIcon={false}
      action={async () => {
        const key = await getEncryptionKeyOnClient()
        if (!key) throw new Error('No encryption key found')
        const encryptedPassphrases = await Promise.all(
          map(
            filter(stageEncryptionState, (s) => s.passphrase !== null),
            async (passphrase) => {
              const encryptedPassphrase = await encryptWithEncryptionKey({
                plaintext: passphrase.passphrase!,
                key,
              })
              return {
                stageName: passphrase.stageName,
                encryptedPassphrase,
              }
            },
          ),
        )
        return options.action(encryptedPassphrases)
      }}
      icon={<Rocket />}
    >
      Deploy
    </ActionButton>
  )
}
