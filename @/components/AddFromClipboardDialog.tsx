import { getGitenvs, saveGitenvs } from '@/gitenvs/gitenvs'
import { filter, find, map } from 'lodash-es'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { streamRevalidatePath } from '~/super-action/action/streamRevalidatePath'
import { type AddFromClipboardSchema } from './AddFromClipboardDialogClient'
import { PasteEnvVars } from './PasteEnvVars'

export const AddFromClipboardDialog = async ({
  fileId,
}: {
  fileId: string
}) => {
  const gitenvs = await getGitenvs()
  return (
    <>
      <PasteEnvVars
        gitenvs={gitenvs}
        fileId={fileId}
        saveAction={async ({
          envVars: envVarsSelected,
        }: AddFromClipboardSchema) => {
          'use server'

          return superAction(async () => {
            // Merge values for existing keys, new values have priority over existing
            const keysMerged = map(gitenvs.envVars, (envVar) => {
              const pastedEnvVarForExistingKey = find(
                envVarsSelected,
                (pastedEnvVar) => {
                  return pastedEnvVar.key === envVar.key
                },
              )
              if (!pastedEnvVarForExistingKey) {
                return envVar
              }
              return {
                ...envVar,
                values: {
                  ...envVar.values,
                  ...pastedEnvVarForExistingKey.values,
                },
              }
            })
            // filter new env vars that are already merged with existing keys
            const newEnvVars = filter(envVarsSelected, (pastedEnvVar) => {
              return !find(gitenvs.envVars, (envVar) => {
                return envVar.key === pastedEnvVar.key
              })
            })

            // combine existing keys with merged keys and new keys
            const newGitenvs = {
              ...gitenvs,
              envVars: [...keysMerged, ...newEnvVars],
            }

            await saveGitenvs(newGitenvs)
            streamRevalidatePath('/', 'layout')
            streamDialog(null)
          })
        }}
      />
    </>
  )
}
