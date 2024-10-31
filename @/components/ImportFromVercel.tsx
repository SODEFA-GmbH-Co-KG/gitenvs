import { getGitenvs } from '@/gitenvs/gitenvs'
import { getGlobalConfig } from '@/gitenvs/globalConfig'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { Vercel } from '@vercel/sdk'
import { type Envs } from '@vercel/sdk/dist/commonjs/models/operations/filterprojectenvs'
import { filter, groupBy, map } from 'lodash-es'
import { Fragment } from 'react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { AddFromClipboardDialog } from './AddFromClipboardDialog'
import { SimpleParamSelect } from './simple/SimpleParamSelect'
import { getVercelProjects } from './vercel/getVercelProjects'
import { getVercelTeams } from './vercel/getVercelTeams'

export const ImportFromVercel = async ({
  fileId,
  projectId,
  teamId,
}: {
  fileId: string
  projectId?: string
  teamId?: string
}) => {
  const config = await getGlobalConfig()
  const [teams, projects] = await Promise.all([
    getVercelTeams({ config }),
    teamId ? getVercelProjects({ config, teamId }) : Promise.resolve([]),
  ])

  return (
    <div className="flex flex-col gap-8">
      Import from Vercel Project Select your vercel Project
      <SimpleParamSelect
        label="Team"
        component="dropdown"
        paramKey="teamId"
        options={teams.map((team) => ({
          value: team.id,
          label: team.name,
        }))}
      />
      <SimpleParamSelect
        label="Projects"
        disabled={!projects.length}
        component="dropdown"
        paramKey="projectId"
        options={projects.map((team) => ({
          value: team.id,
          label: team.name,
        }))}
      />
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
                (env) => env.type === 'encrypted' && !env.decrypted,
              )
              const alreadyDecrypted = filter(
                res.envs,
                (env) => env.type === 'plain',
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
              console.dir({ decryptedVars }, { depth: 10 })

              const grouped = groupBy(
                [...alreadyDecrypted, ...decryptedVars],
                'key',
              )

              console.dir({ grouped }, { depth: 10 })

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
                          console.log('close')

                          streamDialog(null)
                        })
                      }}
                    />
                  ),
                })
              })
            }}
          >
            Vercel Magic 🪄
          </ActionButton>
        </Fragment>
      </div>
      {/* <ActionButton action={onNext}>Next</ActionButton> */}
    </div>
  )
}
