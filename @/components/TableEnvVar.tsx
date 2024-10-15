'use client'

import {
  type EnvStage,
  type EnvVar,
  type EnvVarValue,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import NiceModal from '@ebay/nice-modal-react'
import { EditEnvVarDialog } from './EditEnvVarDialog'
import { Button } from './ui/button'

export const TableEnvVar = ({
  gitenvs,
  envVar,
  envStage,
}: {
  gitenvs: Gitenvs
  envVar: EnvVar
  envStage: EnvStage
}) => {
  return (
    <Button
      variant="ghost"
      tabIndex={0}
      onClick={async () => {
        await NiceModal.show(EditEnvVarDialog, {
          envVar,
          envStage,
          gitenvs,
        })
      }}
      className="flex cursor-pointer items-center justify-start p-1"
    >
      <Content envVarValue={envVar.values[envStage.name]} />
    </Button>
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
