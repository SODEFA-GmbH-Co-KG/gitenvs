import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { saveGitenvs } from '@/gitenvs/gitenvs'
import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { map } from 'lodash-es'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export const LinkEnvVarDialog = ({
  gitenvs,
  fileId,
}: {
  gitenvs: Gitenvs
  fileId: string
}) => {
  return (
    <ActionForm
      action={async (formData) => {
        'use server'

        return superAction(async () => {
          const merged = map(gitenvs.envVars, (ev) => {
            const checked = formData.get(ev.id)
            return checked ? { ...ev, fileIds: [...ev.fileIds, fileId] } : ev
          })
          await saveGitenvs({
            ...gitenvs,
            envVars: merged,
          })

          streamDialog(null)
          revalidatePath('/', 'layout')
        })
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4">
        {map(
          gitenvs.envFiles.filter((file) => file.id !== fileId),
          (file) => {
            const envVars = gitenvs.envVars.filter(
              (ev) =>
                ev.fileIds.includes(file.id) && !ev.fileIds.includes(fileId),
            )
            return (
              <Fragment key={file.id}>
                <div className="font-bold">{file.name}</div>
                {!envVars.length && <div className="italic">File Empty</div>}
                {map(envVars, (ev) => {
                  return (
                    <div key={ev.id} className="flex gap-2">
                      <Checkbox id={ev.id} value={ev.id} name={ev.id} />
                      <Label htmlFor={ev.id}>{ev.key}</Label>
                    </div>
                  )
                })}
                <hr />
              </Fragment>
            )
          },
        )}
      </div>

      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </ActionForm>
  )
}
