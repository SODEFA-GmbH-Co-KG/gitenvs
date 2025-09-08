'use client'

import { createKeys } from '@/gitenvs/createKeys'
import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { type EnvStage, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { useAtom } from 'jotai'
import { map } from 'lodash-es'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { saveGitenvs } from '~/lib/gitenvs'
import { useShowDialog } from '~/super-action/dialog/DialogProvider'
import { ActionForm } from '~/super-action/form/ActionForm'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export const AddNewStage = ({ gitenvs }: { gitenvs: Gitenvs }) => {
  const [stageEncryptionState, setStageEncryptionState] = useAtom(
    stageEncryptionStateAtom,
  )
  const router = useRouter()
  const showDialog = useShowDialog()

  return (
    <ActionForm
      className="flex flex-col gap-4 pt-2"
      action={async (formData) => {
        const name = z.string().parse(formData.get('name'))
        const copyFromStage = z.string().parse(formData.get('copyFromStage'))

        if (gitenvs.envStages.some((s) => s.name === name)) {
          toast.error('Stage already exists')
          return
        }

        const keys = await createKeys()
        const newStage = {
          name,
          publicKey: keys.publicKey,
          encryptedPrivateKey: keys.encryptedPrivateKey,
        } satisfies EnvStage
        gitenvs.envStages.push(newStage)
        gitenvs.envVars = await Promise.all(
          map(gitenvs.envVars, async (v) => {
            const fromValue = v.values[copyFromStage]
            if (!fromValue) {
              return v
            }

            const fromStage = gitenvs.envStages.find(
              (s) => s.name === copyFromStage,
            )

            if (!fromStage) {
              return v
            }

            const fromStageState = stageEncryptionState?.find(
              (s) => s.stageName === copyFromStage,
            )
            const shouldDecrypt =
              fromValue?.encrypted &&
              fromValue?.value &&
              fromStageState?.passphrase

            if (!shouldDecrypt) {
              v.values[name] = fromValue
              return v
            }

            const decryptedValue = await decryptEnvVar({
              encrypted: fromValue.value,
              encryptedPrivateKey: fromStage.encryptedPrivateKey,
              passphrase: fromStageState.passphrase ?? '',
            })

            const encryptedValue = await encryptEnvVar({
              plaintext: decryptedValue ?? '',
              publicKey: newStage.publicKey,
            })

            v.values[name] = {
              ...fromValue,
              value: encryptedValue,
              encrypted: true,
            }

            return v
          }),
        )
        await saveGitenvs(gitenvs)
        setStageEncryptionState((prev) => {
          if (!prev) return prev
          return [
            ...prev,
            { stageName: name, passphrase: keys.passphrase, showValues: false },
          ]
        })
        router.push('/setup/save?redirect=/')
        toast.success('Stage added', {
          description: 'Please save the stages passphrase',
        })
        await showDialog(null)
      }}
    >
      {({ isLoading }) => (
        <>
          <Input name="name" placeholder="Stage Name" />
          <Select name="copyFromStage">
            <SelectTrigger>
              <SelectValue placeholder="Copy from Stage" />
            </SelectTrigger>
            <SelectContent>
              {stageEncryptionState?.map((s) => (
                <SelectItem key={s.stageName} value={s.stageName}>
                  {s.stageName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="self-end" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
        </>
      )}
    </ActionForm>
  )
}
