'use client'

import { createKeys } from '@/gitenvs/createKeys'
import { type EnvStage, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { saveGitenvs } from '~/lib/gitenvs'
import { useShowDialog } from '~/super-action/dialog/DialogProvider'
import { ActionForm } from '~/super-action/form/ActionForm'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { Button } from './ui/button'
import { Input } from './ui/input'

export const AddNewStage = ({ gitenvs }: { gitenvs: Gitenvs }) => {
  const setStageEncryptionState = useSetAtom(stageEncryptionStateAtom)
  const router = useRouter()
  const showDialog = useShowDialog()

  return (
    <ActionForm
      className="flex flex-col gap-4 pt-2"
      action={async (formData) => {
        const name = z.string().parse(formData.get('name'))

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
          <Button type="submit" className="self-end" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
        </>
      )}
    </ActionForm>
  )
}
