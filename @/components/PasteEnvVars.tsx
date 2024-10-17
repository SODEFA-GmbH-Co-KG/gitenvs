'use client'
import { useEffect } from 'react'
import { type SuperActionPromise } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'

export const PasteEnvVars = ({
  action,
}: {
  action: (options: { clipboardText: string }) => SuperActionPromise<unknown>
}) => {
  const { trigger } = useSuperAction({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: action as any,
  })

  // const [envVarsToAdd, setEnvVarsToAdd] = useState<DotenvParseOutput>()

  const handlePaste = async (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData('text')

    if (!text) return

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    await trigger({ clipboardText: text } as any)
    // const result = dotenv.parse(text)
    // const hasResults = Object.keys(result).length > 0
    // if (!hasResults) return
    // event.preventDefault()
    // setEnvVarsToAdd(result)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('paste', handlePaste)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('paste', handlePaste)
      }
    }
  }, [])

  return null
}
