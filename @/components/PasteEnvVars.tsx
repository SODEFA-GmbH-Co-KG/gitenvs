'use client'
import { EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { parse } from 'dotenv'
import { atom, useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useCallback, useEffect } from 'react'

export const envVarsToAddAtom = atom<EnvVar[] | undefined>(undefined)

export const PasteEnvVars = ({
  gitenvs,
  fileId,
}: {
  gitenvs: Gitenvs
  fileId: string
}) => {
  // const { trigger } = useSuperAction({
  //   action: action,
  // })

  // const [envVarsToAdd, setEnvVarsToAdd] = useState<DotenvParseOutput>()
  const setEnvs = useSetAtom(envVarsToAddAtom)
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text')

      if (!text) return

      // await trigger({ clipboardText: text })
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
    [fileId, gitenvs.envStages, setEnvs],
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
