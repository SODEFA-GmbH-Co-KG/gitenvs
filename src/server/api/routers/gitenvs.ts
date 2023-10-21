import { getGitenvs, saveGitenvs } from '~/gitenvs/getGitenvs'
import { EnvVar } from '~/gitenvs/gitenvs.schema'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const gitenvsRouter = createTRPCRouter({
  getGitenvs: publicProcedure.query(async () => {
    const gitenvs = await getGitenvs()
    return gitenvs
  }),
  saveEnvVar: publicProcedure.input(EnvVar).mutation(async ({ input }) => {
    const gitenvs = await getGitenvs()
    const index = gitenvs.envVars.findIndex((v) => v.key === input.key)
    if (index === -1) {
      gitenvs.envVars.push(input)
    } else {
      gitenvs.envVars[index] = input
    }
    await saveGitenvs(gitenvs)
    return { success: true }
  }),
})
