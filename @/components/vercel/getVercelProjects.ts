import { type GlobalConfig } from '@/gitenvs/globalConfig'
import { orderBy } from 'lodash-es'
import { z } from 'zod'

export const getVercelProjects = async ({
  config,
  teamId,
}: {
  config: GlobalConfig
  teamId: string
}) => {
  const projects = await fetch(
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
    .then((proj) => orderBy(proj, (p) => p.name))

  return projects
}
