import { getGlobalConfig, GlobalConfig } from '@/gitenvs/globalConfig'
import { z } from 'zod'
import { SimpleParamSelect } from './simple/SimpleParamSelect'

export const DeployVercel = async ({ teamId }: { teamId?: string }) => {
  const config = await getGlobalConfig()

  if (!config.vercelToken) {
    return <div>No Vercel token set</div>
  }

  return <Selectors config={config} teamId={teamId} />
}

const Selectors = async ({
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
      <div className="grid grid-cols-2 gap-4">
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
      </div>
    </>
  )
}
