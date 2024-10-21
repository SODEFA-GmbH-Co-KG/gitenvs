'use client'

import { type ReactNode } from 'react'
import { DropdownMenuItem } from './ui/dropdown-menu'

export const DropdownMenuItemStopPropagation = ({
  children,
}: {
  children: ReactNode
}) => {
  return (
    <DropdownMenuItem
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {children}
    </DropdownMenuItem>
  )
}
