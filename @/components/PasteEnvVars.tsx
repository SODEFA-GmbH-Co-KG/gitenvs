'use client'
import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { parse } from 'dotenv'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useCallback, useEffect } from 'react'
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
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.tagName === 'INPUT'
      )
        return
      if (envVarsInAtom !== undefined) return
      const text = event.clipboardData?.getData('text')

      if (!text) return
      const result = parse(text)
      const hasResults = Object.keys(result).length > 0
      if (!hasResults) return
      event.preventDefault()
      setEnvs(
        map(result, (value, key) => {
          const values = Object.fromEntries(
            map(gitenvs.envStages, (stage) => [
              stage.name,
              { value, encrypted: false },
            ]),
          )
          return { id: getNewEnvVarId(), fileId, key, values }
        }),
      )
    },
    [fileId, gitenvs.envStages, setEnvs, envVarsInAtom],
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

  if (!envVarsInAtom) return null
  return <AddFromClipboardDialog gitenvs={gitenvs} fileId={fileId} />
}
