import {
  getGlobalConfig,
  GlobalConfig,
  setGlobalConfig,
} from '@/gitenvs/globalConfig'
import { MoreVertical } from 'lucide-react'
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate'
import Link from 'next/link'
import { z } from 'zod'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { ActionForm } from '~/super-action/form/ActionForm'
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

export const DeployVercel = async ({ teamId }: { teamId?: string }) => {
  const config = await getGlobalConfig()

  if (!config.vercelToken) {
    return <TokenInput />
  }

  return (
    <div className="flex flex-col gap-4">
      <Deployer config={config} teamId={teamId} />
    </div>
  )
}

const Deployer = async ({
  config,
  teamId,
}: {
  config: GlobalConfig
  teamId?: string
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
