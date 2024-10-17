import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { saveGitenvs } from '@/gitenvs/gitenvs'
import { Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { type DotenvParseOutput } from 'dotenv'
import { map } from 'lodash-es'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'

export const AddFromClipboardDialog = ({
  envVars,
  fileId,
  gitenvs,
}: {
  fileId: string
  envVars: DotenvParseOutput
  gitenvs: Gitenvs
}) => {
  return (
    <ActionForm
      action={async (event) => {
        'use server'

        return superAction(async () => {
          const pastedEnvVars = map(envVars, (value, key) => ({
            id: getNewEnvVarId(),
            fileId,
            key,
            values: Object.fromEntries(
              map(gitenvs.envStages, (stage) => [
                stage.name,
                { value, encrypted: false },
              ]),
            ),
          }))
          const newGitenvs = {
            ...gitenvs,
            envVars: [...gitenvs.envVars, ...pastedEnvVars],
          }
          await saveGitenvs(newGitenvs)
          streamDialog(null)
        })
      }}
    >
      <div className="grid gap-4 py-4">
        {map(envVars, (value, key) => (
          <div key={key} className="flex w-full">
            <div className="truncate">{key}=</div>
            <div className="flex-1 truncate">{value}</div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </ActionForm>
  )
}
