'use client'

import { createKeys } from '@/gitenvs/createKeys'
import { type EnvStage, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { useSetAtom } from 'jotai'
import { z } from 'zod'
import { saveGitenvs } from '~/lib/gitenvs'
import { ActionForm } from '~/super-action/form/ActionForm'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { Button } from './ui/button'
import { Input } from './ui/input'

export const AddNewStage = ({ gitenvs }: { gitenvs: Gitenvs }) => {
  const setStageEncryptionState = useSetAtom(stageEncryptionStateAtom)

  return (
    <ActionForm
      className="flex flex-col gap-4 pt-2"
      action={async (formData) => {
        const keys = await createKeys()
        const name = z.string().parse(formData.get('name'))
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
      }}
    >
      <Input name="name" placeholder="Stage Name" />
      <Button type="submit" className="self-end">
        Add
      </Button>
    </ActionForm>
  )
}
