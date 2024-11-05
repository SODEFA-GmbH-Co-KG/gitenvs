import { getGitenvs } from '@/gitenvs/gitenvs'
import { getGlobalConfig } from '@/gitenvs/globalConfig'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { Vercel } from '@vercel/sdk'
import { type Envs } from '@vercel/sdk/dist/commonjs/models/operations/filterprojectenvs'
import { filter, groupBy, map, some } from 'lodash-es'
import { Fragment } from 'react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { AddFromClipboardDialog } from './AddFromClipboardDialog'
import { DeleteVercelEnvsDialog } from './vercel/DeleteVercelEnvsDialog'
import { VercelTeamProjectSelect } from './vercel/VercelTeamProjectSelect'

export const ImportFromVercel = async ({
  fileId,
  projectId,
  teamId,
}: {
  fileId: string
  projectId?: string
  teamId?: string
}) => {
  return (
    <div className="flex flex-col gap-8">
      Select your Vercel Project:
      <VercelTeamProjectSelect teamId={teamId} />
      <div className="grid grid-cols-4 gap-2">
        <Fragment>
          <ActionButton
            catchToast
            command={{
              label: `Import from vercel`,
              group: 'Next Best Action',
            }}
            action={async () => {
              'use server'
              const gitenvs = await getGitenvs()

              const config = await getGlobalConfig()
              const vercel = new Vercel({
                bearerToken: config.vercelToken,
              })

              if (!projectId) return

              const res = (await vercel.envs.listByProject({
                idOrName: projectId,
                teamId: teamId,
              })) as { envs: Envs[] }

              const needDecryption = filter(
                res.envs,
                (env) =>
                  env.type === 'encrypted' && !env.decrypted && !env.gitBranch,
              )
              const alreadyDecrypted = filter(
                res.envs,
                (env) => env.type === 'plain' && !env.gitBranch,
              )

              const decryptedVars = await Promise.all(
                needDecryption.map(async (env) => {
                  const envDecrypted = await fetch(
                    `https://api.vercel.com/v1/projects/${projectId}/env/${env.id}?teamId=${teamId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${config.vercelToken}`,
                      },
                      method: 'get',
                    },
                  )

                  return envDecrypted.json() as Envs
                }),
              )

              const grouped = groupBy(
                [...alreadyDecrypted, ...decryptedVars],
                'key',
              )

              const envVarsToAdd = map(grouped, (value, key) => {
                const values = Object.fromEntries(
                  map(gitenvs.envStages, (stage) => {
                    const envStageToVercelStage =
                      stage.name === 'development'
                        ? 'development'
                        : stage.name === 'production'
                          ? 'production'
                          : 'preview'
                    const valueInStage =
                      value.find((v) =>
                        v.target?.includes(envStageToVercelStage),
                      )?.value ?? ''
                    return [
                      stage.name,
                      { value: valueInStage, encrypted: false, fileId },
                    ]
                  }),
                )
                return { id: getNewEnvVarId(), fileId, key, values }
              })
              return superAction(async () => {
                streamDialog({
                  title: `Import Env from Vercel`,
                  content: (
                    <AddFromClipboardDialog
                      gitenvs={gitenvs}
                      fileId={fileId}
                      newEnvVars={envVarsToAdd}
                      onClose={async () => {
                        'use server'
                        return superAction(async () => {
                          const gitenvs = await getGitenvs()
                          // console.log({
                          //   envVarsToAdd,
                          //   gitenvs: gitenvs.envVars,
                          // })
                          const currentEnvVarsInFile = filter(
                            gitenvs.envVars,
                            (env) => env.fileId === fileId,
                          )

                          const vercelEnvsToDelete = [
                            ...alreadyDecrypted,
                            ...decryptedVars,
                          ]
                            .filter((env) => {
                              return some(
                                currentEnvVarsInFile,
                                (envVar) => envVar.key === env.key,
                              )
                            })
                            .map((env) => {
                              return { id: env.id!, key: env.key! }
                            })
                          streamDialog({
                            title: 'Delete imported Envs from Vercel',
                            cancel: 'cancel',
                            content: (
                              <DeleteVercelEnvsDialog
                                vercelEnvs={vercelEnvsToDelete}
                                onDelete={async (formdata) => {
                                  'use server'
                                  return superAction(async () => {
                                    const config = await getGlobalConfig()
                                    const toDelete = map(
                                      Array.from(formdata.entries()),
                                      (value) => {
                                        return {
                                          id: value[0],
                                          value: value[1],
                                        }
                                      },
                                    )
                                    console.log({ toDelete })

                                    //TODO: uncomment this if pr reviewed 😱

                                    // await Promise.all(
                                    //   toDelete.map(async (env) => {
                                    //     return fetch(
                                    //       `https://api.vercel.com/v9/projects/${projectId}/env/${env.id}?teamId=${teamId}`,
                                    //       {
                                    //         headers: {
                                    //           Authorization: `Bearer ${config.vercelToken}`,
                                    //         },
                                    //         method: 'delete',
                                    //       },
                                    //     )
                                    //   }),
                                    // )

                                    streamDialog(null)
                                  })
                                }}
                              />
                            ),
                          })
                        })
                      }}
                    />
                  ),
                })
              })
            }}
          >
            Load from Vercel 🪄
          </ActionButton>
        </Fragment>
      </div>
      {/* <ActionButton action={onNext}>Next</ActionButton> */}
    </div>
  )
}
