'use client'

import {
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import NiceModal from '@ebay/nice-modal-react'
import { EditEnvVarDialog } from './EditEnvVarDialog'
import { TableEnvVarTag } from './TableEnvVarTag'
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
      <TableEnvVarTag envVarValue={envVar.values[envStage.name]} />
    </Button>
  )
}
