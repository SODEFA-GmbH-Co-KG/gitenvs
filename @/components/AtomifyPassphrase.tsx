'use client'

import { atom, useAtom } from 'jotai'
import { map } from 'lodash-es'
import { useEffect } from 'react'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import {
  decryptWithEncryptionKey,
  type EncryptedValue,
} from '~/utils/encryptionToken'

export type StageEncryptionState = {
  showValues: boolean
  decryptionKey: string | null
  stageName: string
}

export const stageEncryptionStateAtom = atom<
  StageEncryptionState[] | undefined
>(undefined)

export const AtomifyPassphrase = ({
  encryptedPassphrases,
}: {
  encryptedPassphrases: {
    stageName: string
    encryptedPassphrase?: EncryptedValue
  }[]
}) => {
  const [stageEncryptionState, setStageEncryptionState] = useAtom(
    stageEncryptionStateAtom,
  )

  const getEncryptionKey = useEncryptionKeyOnClient()

  useEffect(() => {
    if (stageEncryptionState) return

    const decrypt = async () => {
      const encryptionKey = await getEncryptionKey()
      if (!encryptionKey) {
        throw new Error('No encryption key found')
      }

      const passphraseResults = await Promise.all(
        map(encryptedPassphrases, async (pc) => {
          const decrypted = pc.encryptedPassphrase
            ? await decryptWithEncryptionKey({
                ...pc.encryptedPassphrase,
                key: encryptionKey,
              })
            : null

          return {
            showValues: false,
            decryptionKey: decrypted,
            stageName: pc.stageName,
          }
        }),
      )

      setStageEncryptionState(passphraseResults)
    }

    void decrypt()
  }, [getEncryptionKey, encryptedPassphrases, setStageEncryptionState])

  return null
}
