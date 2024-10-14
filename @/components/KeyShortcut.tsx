import { type ReactNode } from 'react'

export const KeyShortcut = ({ children }: { children?: ReactNode }) => {
  return (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted p-1 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
      {children}
    </kbd>
  )
}

export const getCmdCtrlKey = () => {
  if (
    typeof navigator !== 'undefined' &&
    'platform' in navigator &&
    navigator.platform.includes('Mac')
  ) {
    return '⌘'
  }
  return 'Ctrl'
}
