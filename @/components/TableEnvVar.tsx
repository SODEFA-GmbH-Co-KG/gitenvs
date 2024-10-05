'use client'

import {
  type EnvStage,
  type EnvVar,
  type EnvVarValue,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import NiceModal from '@ebay/nice-modal-react'
import { EditEnvVarDialog } from './EditEnvVarDialog'

export const TableEnvVar = ({
  gitenvs,
  envVar,
  envStage,
}: {
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
      <Content envVarValue={envVar.values[envStage.name]} />
    </div>
  )
}

const Content = ({ envVarValue }: { envVarValue?: EnvVarValue }) => {
  if (!envVarValue || envVarValue.value === '') {
    return (
      <span className="rounded-sm bg-gray-600 p-1 text-xs uppercase">
        Empty
      </span>
    )
  }

  if (envVarValue.encrypted) {
    return (
      <span className="rounded-sm bg-primary p-1 text-xs uppercase text-black">
        Encrypted
      </span>
    )
  }

  return envVarValue.value
}
