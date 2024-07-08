'use client'

import NiceModal from '@ebay/nice-modal-react'
import { type ReactNode } from 'react'
import {
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '~/gitenvs/gitenvs.schema'
import { EditEnvVarDialog } from './EditEnvVarDialog'

export const TableEnvVar = ({
  children,
  gitenvs,
  envVar,
  envStage,
}: {
  children: ReactNode
  gitenvs: Gitenvs
  envVar: EnvVar
  envStage: EnvStage
}) => {
  const handler = async () => {
    const activeElement = document.activeElement
    try {
      await NiceModal.show(EditEnvVarDialog, {
        envVar,
        envStage,
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
      onKeyDown={(event) => event.key === 'Enter' && handler()}
      className="flex cursor-pointer items-center p-1"
    >
      {children}
    </div>
  )
}
