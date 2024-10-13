'use client'

import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { type EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { ReactNode, useState } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'

export const EditEnvKeyDialog = ({
  envVar,
  gitenvs,
  dropdown,
}: {
  envVar: EnvVar
  gitenvs: Gitenvs
  dropdown: ReactNode
}) => {
  const [key, setKey] = useState('')

  const updateKey = async () => {
    const newEnVars = gitenvs.envVars.map((v) => {
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
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        await updateKey()
      }}
    >
      <DialogHeader>
        <DialogTitle>Edit Env Key</DialogTitle>
        {/* <DialogDescription>
            Make changes to your profile here.
          </DialogDescription> */}
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Input
          className="col-span-3"
          type="text"
          autoComplete="off"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          onKeyDown={async (event) => {
            if (event.key === 'Enter') {
              return updateKey()
            }
          }}
        />
      </div>
      <DialogFooter>
        {dropdown}
        <Button type="submit">Update</Button>
      </DialogFooter>
    </form>
  )
}
