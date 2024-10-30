'use client'

import { Passphrase } from '@/gitenvs/gitenvs.schema'
import { useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useCallback } from 'react'
import { z } from 'zod'
import {
  type StageEncryptionState,
  stageEncryptionStateAtom,
} from './AtomifyPassphrase'
import { usePasteHandler } from '@/hooks/usePasteHandler'

export const HandlePastePassphrase = () => {
  const setStageEncryptionState = useSetAtom(stageEncryptionStateAtom)

  const handlePastedText = useCallback(
    (text: string) => {
      const pastedPassphrases = z.array(Passphrase).safeParse(JSON.parse(text))
      if (!pastedPassphrases.success) return

      setStageEncryptionState((prev) => {
        if (!prev) return prev

        const newState = map(prev, (passphrase) => {
          if (passphrase.passphrase) return passphrase
          const newPassphrase = pastedPassphrases.data.find(
            (pp) => pp.stageName === passphrase.stageName,
          )
          return {
            showValues: false,
            passphrase: newPassphrase?.passphrase ?? null,
            stageName: passphrase.stageName,
          } satisfies StageEncryptionState
        })
        return newState
      })
    },
    [setStageEncryptionState],
  )

  usePasteHandler({
    onPaste: handlePastedText,
  })

  return null
}
