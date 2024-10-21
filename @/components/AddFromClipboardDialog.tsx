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
  type StagesSchema,
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
      stages={gitenvs.envStages}
      envVars={envVars}
      gitenvs={gitenvs}
      formAction={async ({
        stages,
        envVars: envVarsSelected,
        encrypted,
      }: StagesSchema) => {
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

          const keysMerged = map(gitenvs.envVars, (envVar) => {
            const existingKey = find(pastedEnvVars, (pastedEnvVar) => {
              return pastedEnvVar.key === envVar.key
            })
            if (!existingKey) {
              return envVar
            }
            return {
              ...envVar,
              values: {
                ...envVar.values,
                ...existingKey.values,
              },
            }
          })

          const newEnvVars = filter(pastedEnvVars, (pastedEnvVar) => {
            return !find(gitenvs.envVars, (envVar) => {
              return envVar.key === pastedEnvVar.key
            })
          })

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
