import { getPassphraseEnvName } from '@/gitenvs/env'
import { GlobalConfig } from '@/gitenvs/globalConfig'
import { MoreVertical } from 'lucide-react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { decryptWithEncryptionToken } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'
import { DeployToServiceButton } from '../DeployToServiceButton'
import { SimpleParamSelect } from '../simple/SimpleParamSelect'
import { SimpleParamSwitch } from '../simple/SimpleParamSwitch'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Label } from '../ui/label'
import { TokenInput } from './VercelTokenInput'
import { getVercelProjects } from './getVercelProjects'
import { getVercelTeams } from './getVercelTeams'

export const VercelDeployer = async ({
  config,
  teamId,
  projectId,
  upsert,
}: {
  config: GlobalConfig
  teamId?: string
  projectId?: string
  upsert?: boolean
}) => {
  const [teams, projects] = await Promise.all([
    getVercelTeams({ config }),
    teamId ? getVercelProjects({ config, teamId }) : Promise.resolve([]),
  ])

  const team = teams.find((team) => team.id === teamId)
  const project = projects.find((project) => project.id === projectId)

  return (
    <>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-4">
        <SimpleParamSelect
          label="Team"
          component="dropdown"
          paramKey="teamId"
          options={teams.map((team) => ({
            value: team.id,
            label: team.name,
          }))}
        />
        {projects.length > 0 ? (
          <SimpleParamSelect
            label="Projects"
            component="dropdown"
            paramKey="projectId"
            options={projects.map((team) => ({
              value: team.id,
              label: team.name,
            }))}
          />
        ) : (
          <div></div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent forceMount>
            <DropdownMenuItem asChild>
              <ActionButton
                variant="ghost"
                action={async () => {
                  'use server'
                  return superAction(async () => {
                    streamDialog({
                      title: 'Update Vercel Token',
                      content: <TokenInput closeDialog />,
                    })
                  })
                }}
              >
                Update Vercel Token
              </ActionButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!!teamId && !!projectId && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-end gap-4">
            <Label htmlFor="upsert">Overwrite env vars on conflict?</Label>
            <SimpleParamSwitch id="upsert" paramKey="upsert" />
          </div>
          <DeployToServiceButton
            askForConfirmation={{
              title: 'Deploy to Vercel',
              content: (
                <p>
                  Are you sure you want to deploy to{' '}
                  <span className="font-bold">
                    {team?.name}/{project?.name}
                  </span>
                  ?
                </p>
              ),
            }}
            action={async (encryptedPassphrases) => {
              'use server'
              return superAction(async () => {
                const decryptedPassphrases = await Promise.all(
                  encryptedPassphrases.map(async (encryptedPassphrase) => {
                    const passphrase = await decryptWithEncryptionToken({
                      ...encryptedPassphrase.encryptedPassphrase,
                      key: await getEncryptionKeyOnServer(),
                    })
                    return {
                      passphrase,
                      stageName: encryptedPassphrase.stageName,
                    }
                  }),
                )

                const envs = decryptedPassphrases.flatMap(
                  ({ passphrase, stageName }) => {
                    const target = [
                      stageName === 'staging' ? 'preview' : stageName, // FIXME: This should not be hardcoded!
                    ]
                    return [
                      {
                        key: getPassphraseEnvName({
                          stage: stageName,
                        }),
                        value: passphrase,
                        type:
                          stageName === 'development'
                            ? 'encrypted'
                            : 'sensitive', // FIXME: This should not be hardcoded!
                        target,
                      },
                      {
                        key: 'GITENVS_STAGE_ENV_NAME',
                        value: stageName,
                        type: 'plain',
                        target,
                      },
                    ]
                  },
                )

                const response = await fetch(
                  `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=${upsert}`,
                  {
                    body: JSON.stringify(envs),
                    headers: {
                      Authorization: `Bearer ${config.vercelToken}`,
                    },
                    method: 'post',
                  },
                )

                if (!response.ok) {
                  const data = await response.json()
                  console.dir(data, { depth: Infinity, colors: true })
                  throw new Error(
                    'Failed to deploy to Vercel. See server console for details.',
                  )
                }
              })
            }}
          />
        </div>
      )}
    </>
  )
}
