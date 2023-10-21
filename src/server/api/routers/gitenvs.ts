import { z } from 'zod'
import { getGitenvs, saveGitenvs } from '~/gitenvs/getGitenvs'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const gitenvsRouter = createTRPCRouter({
  getGitenvs: publicProcedure.query(async () => {
    const gitenvs = await getGitenvs()
    return gitenvs
  }),
  saveGitenvs: publicProcedure
    .input(z.object({ gitenvs: Gitenvs }))
    .mutation(async ({ input }) => {
      await saveGitenvs(input.gitenvs)
    }),
})
