'use client'
import { useEffect } from 'react'
import { type ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommandKeyboardShortcut = ({
  command,
  disabled,
}: {
  command: ActionCommandConfig
  disabled?: boolean
}) => {
  const { action, shortcut } = command

  useEffect(() => {
    if (disabled) return
    if (!shortcut) return
    const down = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) return
      if (shortcut.cmdCtrl && (!e.metaKey || !e.ctrlKey)) return
      if (shortcut.shift && !e.shiftKey) return
      // if (shortcut.alt && !e.altKey) return

      e.preventDefault()
      await action()
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [action, disabled, shortcut])

  return null
}
