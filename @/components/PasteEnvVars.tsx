'use client'
import { useEffect } from 'react'
import { SuperActionWithInput } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'

export const PasteEnvVars = ({
  action,
}: {
  action: SuperActionWithInput<{ clipboardText: string }>
}) => {
  const { trigger } = useSuperAction({
    action: action,
  })

  // const [envVarsToAdd, setEnvVarsToAdd] = useState<DotenvParseOutput>()

  const handlePaste = async (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData('text')

    if (!text) return

    await trigger({ clipboardText: text })
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
