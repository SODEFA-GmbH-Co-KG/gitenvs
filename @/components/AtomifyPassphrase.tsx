'use client'

import { Passphrase } from '@/gitenvs/gitenvs.schema'
import { atom, useAtom } from 'jotai'
import { map } from 'lodash-es'
import { useCallback, useEffect } from 'react'
import { z } from 'zod'
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
  }, [
    getEncryptionKey,
    encryptedPassphrases,
    setStageEncryptionState,
    stageEncryptionState,
  ])

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.tagName === 'INPUT'
      )
        return

      const text = event.clipboardData?.getData('text')

      if (!text) return

      const pastedPassphrases = z.array(Passphrase).safeParse(JSON.parse(text))
      console.log({ pastedPassphrases })

      if (!pastedPassphrases.success) return

      setStageEncryptionState((prev) => {
        if (!prev) return prev

        const newState = map(prev, (passphrase) => {
          if (passphrase.decryptionKey) return passphrase
          const newPassphrase = pastedPassphrases.data.find(
            (pp) => pp.stageName === passphrase.stageName,
          )
          return {
            showValues: false,
            decryptionKey: newPassphrase?.passphrase ?? null,
            stageName: passphrase.stageName,
          } satisfies StageEncryptionState
        })
        return newState
      })
    },
    [setStageEncryptionState],
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('paste', handlePaste)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('paste', handlePaste)
      }
    }
  }, [handlePaste])

  return null
}
