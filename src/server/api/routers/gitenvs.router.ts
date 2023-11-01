import { z } from 'zod'
import { createKeys } from '~/gitenvs/createKeys'
import { getGitenvs, saveGitenvs } from '~/gitenvs/gitenvs'
import { CreateGitenvsJson, Gitenvs } from '~/gitenvs/gitenvs.schema'
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
  gitenvsJsonExists: publicProcedure.query(async () => {
    try {
      await getGitenvs()
      return true
    } catch (error) {
      return false
    }
  }),
  createGitenvsJson: publicProcedure
    .input(CreateGitenvsJson)
    .mutation(async ({ input }) => {
      const stages = await Promise.all(
        input.envStages.map(async (stage) => {
          const keys = await createKeys()

          return {
            name: stage.name,
            ...keys,
          }
        }),
      )

      await saveGitenvs({
        version: '1',
        envStages: stages.map(({ passphrase: _, ...stage }) => stage), // IMPORTANT: Don't save the passphrase to gitenvs.json
        envFiles: [
          {
            ...input.envFile,
            id: globalThis.crypto.randomUUID(),
          },
        ],
        envVars: [],
      })

      return {
        passphrases: stages.map((stage) => ({
          stageName: stage.name,
          passphrase: stage.passphrase,
        })),
      }
    }),
})
