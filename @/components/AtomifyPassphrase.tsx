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
  passphrase: string | null
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
    const decrypt = async () => {
      const encryptionKey = await getEncryptionKey()
      if (!encryptionKey) return

      const passphraseResults = await Promise.all(
        map(encryptedPassphrases, async (pc) => {
          const passphrase = pc.encryptedPassphrase
            ? await decryptWithEncryptionKey({
                ...pc.encryptedPassphrase,
                key: encryptionKey,
              })
            : null

          return {
            showValues: false,
            passphrase,
            stageName: pc.stageName,
          }
        }),
      )

      // necessary to check for reroll action
      if (
        !stageEncryptionState?.every((ses) =>
          passphraseResults.some(
            (pr) =>
              pr.stageName === ses.stageName &&
              pr.passphrase === ses.passphrase,
          ),
        )
      ) {
        setStageEncryptionState(passphraseResults)
        console.dir(passphraseResults, { depth: null })
      }
    }

    decrypt().catch(console.error)
  }, [
    getEncryptionKey,
    encryptedPassphrases,
    setStageEncryptionState,
    stageEncryptionState,
  ])

  return null
}
