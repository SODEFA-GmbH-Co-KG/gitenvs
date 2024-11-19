'use client'
import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { usePasteHandler } from '@/hooks/usePasteHandler'
import { parse } from 'dotenv'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useCallback } from 'react'
import { AddFromClipboardDialog } from './AddFromClipboardDialog'

export const envVarsToAddAtom = atom<EnvVar[] | undefined>(undefined)

export const PasteEnvVars = ({
  gitenvs,
  fileId,
}: {
  gitenvs: Gitenvs
  fileId: string
}) => {
  const setEnvs = useSetAtom(envVarsToAddAtom)
  const envVarsInAtom = useAtomValue(envVarsToAddAtom)

  const handlePastedText = useCallback(
    (text: string) => {
      const result = parse(text)
      const hasResults = Object.keys(result).length > 0
      if (!hasResults) return

      setEnvs(
        map(result, (value, key) => {
          const values = Object.fromEntries(
            map(gitenvs.envStages, (stage) => [
              stage.name,
              { value, encrypted: false },
            ]),
          )
          return { id: getNewEnvVarId(), fileIds: [fileId], key, values }
        }),
      )
    },
    [fileId, gitenvs.envStages, setEnvs],
  )

  usePasteHandler({
    onPaste: handlePastedText,
    enabled: envVarsInAtom === undefined,
  })

  if (!envVarsInAtom) return null
  return <AddFromClipboardDialog gitenvs={gitenvs} fileId={fileId} />
}
