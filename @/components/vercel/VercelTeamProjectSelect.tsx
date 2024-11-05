import { getGlobalConfig } from '@/gitenvs/globalConfig'
import { MoreVertical } from 'lucide-react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { SimpleParamSelect } from '../simple/SimpleParamSelect'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { getVercelProjects } from './getVercelProjects'
import { getVercelTeams } from './getVercelTeams'
import { TokenInput } from './VercelTokenInput'

export const VercelTeamProjectSelect = async ({
  // projectId,
  teamId,
}: {
  // projectId?: string
  teamId?: string
}) => {
  const config = await getGlobalConfig()
  const [teams, projects] = await Promise.all([
    getVercelTeams({ config }),
    teamId ? getVercelProjects({ config, teamId }) : Promise.resolve([]),
  ])

  // const team = teams.find((team) => team.id === teamId)
  // const project = projects.find((project) => project.id === projectId)
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
