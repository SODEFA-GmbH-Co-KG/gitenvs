import groupBy from 'lodash/groupBy'
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
      const file = gitenvs.files.find((file) => file.id === fileId)
      const vars = gitenvs.vars.filter((v) => v.fileId === fileId)
      const stages = gitenvs.stages
      const varsByKey = groupBy(vars, (v) => v.key)
      return { varsByKey, stages }
    }),
})
