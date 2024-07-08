'use client'

import NiceModal from '@ebay/nice-modal-react'
import { type ReactNode } from 'react'
import { type EnvVar, type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { EditEnvKeyDialog } from './EditEnvKeyDialog'

export const TableEnvKey = ({
  children,
  gitenvs,
  envVar,
}: {
  children: ReactNode
  gitenvs: Gitenvs
  envVar: EnvVar
}) => {
  const handler = async () => {
    const activeElement = document.activeElement
    try {
      await NiceModal.show(EditEnvKeyDialog, {
        envVar,
        gitenvs,
      })
    } finally {
      setTimeout(() => {
        if (activeElement instanceof HTMLElement) {
          activeElement.focus()
        }
      }, 200)
    }
  }

  return (
    <div
      tabIndex={0}
      onClick={handler}
      onKeyDown={async (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          await handler()
        }
      }}
      className="flex cursor-pointer flex-row justify-between gap-4 p-1"
    >
      {children}
    </div>
  )
}
