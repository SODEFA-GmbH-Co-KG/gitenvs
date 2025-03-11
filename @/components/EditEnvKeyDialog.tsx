'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { map } from 'lodash-es'
import { type ReactNode } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'
import { useShowDialog } from '~/super-action/dialog/DialogProvider'
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
  const showDialog = useShowDialog()

  return (
    <ActionForm
      action={async (formData) => {
        // This code runs on the client side intentionally
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

        await showDialog(null)
      }}
    >
      <DialogHeader>
        <DialogTitle>Edit Env Key</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div className="py-4">
        <Input
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
