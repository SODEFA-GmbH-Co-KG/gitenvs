import { type GlobalConfig } from '@/gitenvs/globalConfig'
import { z } from 'zod'

export const getVercelTeams = async ({ config }: { config: GlobalConfig }) => {
  if (!config.vercelToken) {
    return []
  }

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

        .safeParse(data),
    )
    .then((data) => (data?.success ? data.data.teams : []))

  return teams
}
