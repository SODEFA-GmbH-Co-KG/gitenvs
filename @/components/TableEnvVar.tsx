'use client'

import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import {
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import NiceModal from '@ebay/nice-modal-react'
import { useAtomValue } from 'jotai'
import { FunctionSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
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
  const stageEncryptionStates = useAtomValue(stageEncryptionStateAtom)

  const stageEncryptionState = stageEncryptionStates?.find(
    (s) => s.stageName === envStage.name,
  )
  const showValues = stageEncryptionState?.showValues ?? false

  const initialEnvVarValue = envVar.values[envStage.name]

  const [envVarValue, setEnvVarValue] = useState(envVar.values[envStage.name])

  useEffect(() => {
    const decryptValue = async () => {
      const shouldDecrypt =
        initialEnvVarValue?.encrypted &&
        initialEnvVarValue?.value &&
        stageEncryptionState?.passphrase &&
        showValues
      const decryptedValue = shouldDecrypt
        ? await decryptEnvVar({
            encrypted: initialEnvVarValue.value,
            encryptedPrivateKey: envStage.encryptedPrivateKey,
            passphrase: stageEncryptionState.passphrase ?? '',
          })
        : initialEnvVarValue?.value

      setEnvVarValue({
        encrypted: initialEnvVarValue?.encrypted ?? false,
        value: decryptedValue ?? '',
        isFunction: initialEnvVarValue?.isFunction ?? false,
      })
    }
    decryptValue().catch(console.error)
  }, [
    envStage.encryptedPrivateKey,
    initialEnvVarValue?.encrypted,
    initialEnvVarValue?.value,
    stageEncryptionState?.passphrase,
    initialEnvVarValue?.isFunction,
    showValues,
  ])

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
      className="flex w-full cursor-pointer items-center justify-start gap-1 truncate p-1"
    >
      {envVarValue?.isFunction && (
        <FunctionSquare className="h-4 w-4 shrink-0" />
      )}
      <TableEnvVarTag envVarValue={envVarValue} showValue={showValues} />
    </Button>
  )
}
