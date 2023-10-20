import { z } from 'zod'
import { getGitenvs } from '~/gitenvs/getGitenvs'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const gitenvsRouter = createTRPCRouter({
  getForTable: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .query(async ({ input: { fileId } }) => {
      const gitenvs = await getGitenvs()
      const file = gitenvs.envFiles.find((file) => file.id === fileId)
      const envVars = gitenvs.envVars.filter((v) => v.fileId === fileId)
      const stages = gitenvs.envStages
      return { envVars, stages }
    }),
})
