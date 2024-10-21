import { getGitenvs, saveGitenvs } from '@/gitenvs/gitenvs'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { type DotenvParseOutput } from 'dotenv'
import { filter, find, map } from 'lodash-es'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { streamRevalidatePath } from '~/super-action/action/streamRevalidatePath'
import {
  AddFromClipboardDialogClient,
  type AddFromClipboardSchema,
} from './AddFromClipboardDialogClient'

export const AddFromClipboardDialog = async ({
  envVars,
  fileId,
}: {
  fileId: string
  envVars: DotenvParseOutput
}) => {
  const gitenvs = await getGitenvs()
  return (
    <AddFromClipboardDialogClient
      envVars={envVars}
      gitenvs={gitenvs}
      formAction={async ({
        stages,
        envVars: envVarsSelected,
        encrypted,
      }: AddFromClipboardSchema) => {
        'use server'

        return superAction(async () => {
          const stagesToAdd = filter(gitenvs.envStages, (stage) => {
            return stages.includes(stage.name)
          })
          const pastedEnvVars = filter(
            map(envVars, (value, key) => ({
              id: getNewEnvVarId(),
              fileId,
              key,
              values: Object.fromEntries(
                map(stagesToAdd, (stage) => [
                  stage.name,
                  { value, encrypted: encrypted },
                ]),
              ),
            })),
            (envVar) => {
              return envVarsSelected.includes(envVar.key)
            },
          )

          // Merge values for existing keys, new values have priority over existing
          const keysMerged = map(gitenvs.envVars, (envVar) => {
            const pastedEnvVarForExistingKey = find(
              pastedEnvVars,
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
          const newEnvVars = filter(pastedEnvVars, (pastedEnvVar) => {
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
  )
}
