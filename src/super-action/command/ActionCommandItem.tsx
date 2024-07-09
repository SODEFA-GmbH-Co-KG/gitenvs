'use client'
import { KeyShortcut } from '@/components/KeyShortcut'
import { CommandItem } from '@/components/ui/command'
import { type ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommandItem = ({
  command,
  disabled,
}: {
  command: ActionCommandConfig
  disabled?: boolean
}) => {
  return (
    <CommandItem
      disabled={disabled}
      onSelect={command.action}
      className="flex flex-row"
    >
      <div className="flex flex-1 flex-row">{command.children}</div>
      {command.shortcut && (
        <>
          <div className="flex flex-row gap-0.5">
            {command.shortcut.shift && <KeyShortcut>Shift</KeyShortcut>}
            {command.shortcut.cmdCtrl && (
              <KeyShortcut>{getCmdCtrlKey()}</KeyShortcut>
            )}
            <KeyShortcut>{command.shortcut.key.toUpperCase()}</KeyShortcut>
          </div>
        </>
      )}
    </CommandItem>
  )
}

const getCmdCtrlKey = () => {
  if (
    typeof navigator !== 'undefined' &&
    'platform' in navigator &&
    navigator.platform.includes('Mac')
  ) {
    return '⌘'
  }
  return 'Ctrl'
}
