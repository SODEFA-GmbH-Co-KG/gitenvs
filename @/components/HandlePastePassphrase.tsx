'use client'

import { Passphrase } from '@/gitenvs/gitenvs.schema'
import { useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useCallback, useEffect } from 'react'
import { z } from 'zod'
import {
  type StageEncryptionState,
  stageEncryptionStateAtom,
} from './AtomifyPassphrase'

export const HandlePastePassphrase = () => {
  const setStageEncryptionState = useSetAtom(stageEncryptionStateAtom)

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
