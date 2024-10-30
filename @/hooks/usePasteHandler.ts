import { useCallback, useEffect } from 'react'

type PasteHandlerOptions = {
  excludeInputs?: boolean
  onPaste: (text: string) => void
  enabled?: boolean
}

export const usePasteHandler = ({
  excludeInputs = true,
  onPaste,
  enabled = true,
}: PasteHandlerOptions) => {
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!enabled) return

      if (
        excludeInputs &&
        event.target instanceof HTMLElement &&
        (event.target.tagName === 'INPUT' ||
          event.target.tagName === 'TEXTAREA' ||
          event.target.tagName === 'SELECT')
      ) {
        return
      }

      const text = event.clipboardData?.getData('text')
      if (!text) return

      event.preventDefault()
      onPaste(text)
    },
    [excludeInputs, enabled, onPaste],
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
}
