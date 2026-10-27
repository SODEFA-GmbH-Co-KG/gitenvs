'use client'

import { atom, useAtom } from 'jotai'
import { map } from 'lodash-es'
import { useEffect, useRef } from 'react'
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
    if (stageEncryptionState) return

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

      setStageEncryptionState(passphraseResults)
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

// Forces AtomifyPassphrase to decrypt the passphrases again after a reroll.
// Passphrases of other stages that were only known in the browser are kept.
export const ResetStageEncryptionState = ({
  rerolledStages,
}: {
  rerolledStages: string[]
}) => {
  const [stageEncryptionState, setStageEncryptionState] = useAtom(
    stageEncryptionStateAtom,
  )
  const previousState = useRef(stageEncryptionState)

  useEffect(() => {
    setStageEncryptionState(undefined)
  }, [setStageEncryptionState])

  useEffect(() => {
    const previous = previousState.current
    if (!stageEncryptionState || !previous) return
    if (stageEncryptionState === previous) return
    previousState.current = undefined

    setStageEncryptionState(
      stageEncryptionState.map((state) => {
        if (state.passphrase || rerolledStages.includes(state.stageName)) {
          return state
        }
        const kept = previous.find((p) => p.stageName === state.stageName)
        return kept?.passphrase
          ? { ...state, passphrase: kept.passphrase }
          : state
      }),
    )
  }, [stageEncryptionState, setStageEncryptionState, rerolledStages])

  return null
}
