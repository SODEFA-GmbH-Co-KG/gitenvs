'use client'

import { atom, useAtom } from 'jotai'
import { map, omit } from 'lodash-es'
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

      // compare passphrase results
      if (
        stageEncryptionState?.every((ses) =>
          passphraseResults.some(
            (pr) =>
              pr.stageName === ses.stageName &&
              pr.passphrase === ses.passphrase,
          ),
        )
      ) {
        console.log('no changes')
      } else {
        console.log(
          'changes',
          omit(stageEncryptionState, 'showValues'),
          omit(passphraseResults, 'showValues'),
        )
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
