import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { map } from 'lodash-es'
import { ReactNode } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'

export const EditEnvKeyDialog = ({
  envVar,
  gitenvs,
  dropdown,
}: {
  envVar: EnvVar
  gitenvs: Gitenvs
  dropdown: ReactNode
}) => {
  return (
    <ActionForm
      action={async (formData) => {
        'use server'

        return superAction(async () => {
          const key = formData.get('key')?.toString()
          if (typeof key !== 'string') return

          const newEnVars = map(gitenvs.envVars, (v) => {
            if (v.id !== envVar.id) return v

            return {
              ...v,
              key,
            }
          })

          await saveGitenvs({
            ...gitenvs,
            envVars: newEnVars,
          })

          streamDialog(null)
        })
      }}
    >
      <DialogHeader>
        <DialogTitle>Edit Env Key</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Input
          className="col-span-3"
          type="text"
          autoComplete="off"
          name="key"
          defaultValue={envVar.key}
        />
      </div>
      <DialogFooter>
        {dropdown}
        <Button type="submit">Update</Button>
      </DialogFooter>
    </ActionForm>
  )
}
