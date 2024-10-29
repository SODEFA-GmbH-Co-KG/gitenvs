import { getPassphraseEnvName } from '@/gitenvs/env'
import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import {
  getGlobalConfig,
  GlobalConfig,
  setGlobalConfig,
} from '@/gitenvs/globalConfig'
import { readFile } from 'fs/promises'
import { MoreVertical } from 'lucide-react'
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { join } from 'path'
import { z } from 'zod'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { ActionForm } from '~/super-action/form/ActionForm'
import { decryptWithEncryptionToken } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'
import { DeployToServiceButton } from './DeployToServiceButton'
import { SimpleParamSelect } from './simple/SimpleParamSelect'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Input } from './ui/input'
import { Label } from './ui/label'

const getVercelProject = async () => {
  try {
    const root = await getProjectRoot()
    const vercelProjectJson = join(root, '.vercel', 'project.json')
    const vercelProject = JSON.parse(await readFile(vercelProjectJson, 'utf-8'))
    const parsed = z
      .object({
        projectId: z.string(),
        orgId: z.string(),
      })
      .parse(vercelProject)
    return parsed
  } catch (error) {
    return null
  }
}

export const DeployVercel = async ({
  teamId,
  projectId,
}: {
  teamId?: string
  projectId?: string
}) => {
  const config = await getGlobalConfig()

  if (!config.vercelToken) {
    return <TokenInput />
  }

  if (!teamId && !projectId) {
    const vercelProject = await getVercelProject()
    if (vercelProject) {
      redirect(
        `/setup/deploy?teamId=${vercelProject.orgId}&projectId=${vercelProject.projectId}`,
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Deployer config={config} teamId={teamId} projectId={projectId} />
    </div>
  )
}

const Deployer = async ({
  config,
  teamId,
  projectId,
}: {
  config: GlobalConfig
  teamId?: string
  projectId?: string
}) => {
  const teams = await fetch('https://api.vercel.com/v2/teams?limit=1000', {
    headers: {
      Authorization: `Bearer ${config.vercelToken}`,
    },
    method: 'get',
  })
    .then((res) => res.json())
    .then((data) =>
      z
        .object({
          teams: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
            }),
          ),
        })

        .parse(data),
    )
    .then((data) => data.teams)

  const projects = !teamId
    ? []
    : await fetch(
        `https://api.vercel.com/v9/projects?teamId=${teamId}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${config.vercelToken}`,
          },
          method: 'get',
        },
      )
        .then((res) => res.json())
        .then((data) =>
          z
            .object({
              projects: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                }),
              ),
            })

            .parse(data),
        )
        .then((data) => data.projects)

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
                        stageName === 'development' ? 'encrypted' : 'sensitive', // FIXME: This should not be hardcoded!
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
                `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=false`,
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
      )}
    </>
  )
}

const TokenInput = ({ closeDialog }: { closeDialog?: boolean }) => {
  return (
    <div className="flex flex-col gap-4">
      <p>
        To deploy to Vercel, you need to set a Vercel token. You can get one
        here:{' '}
        <Link
          className="underline hover:no-underline"
          href="https://vercel.com/account/tokens"
          target="_blank"
          rel="noreferrer"
        >
          https://vercel.com/account/tokens
        </Link>
        .
      </p>
      <ActionForm
        action={async (formData) => {
          'use server'
          return superAction(async () => {
            const vercelToken = formData.get('vercelToken')
            if (typeof vercelToken !== 'string') {
              throw new Error('Vercel token is required')
            }
            await setGlobalConfig({ vercelToken })
            revalidatePath('/setup/deploy')
            if (closeDialog) {
              streamDialog(null)
            }
          })
        }}
      >
        <div className="flex flex-col gap-4">
          <Label>Vercel token</Label>
          <div className="flex flex-row gap-4">
            <Input type="password" name="vercelToken" />
            <Button type="submit" className="self-end">
              Save
            </Button>
          </div>
        </div>
      </ActionForm>
    </div>
  )
}
