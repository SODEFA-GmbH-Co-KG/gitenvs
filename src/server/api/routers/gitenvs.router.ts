import { randomUUID } from 'crypto'
import { z } from 'zod'
import { createKeys } from '~/gitenvs/createKeys'
import { getGitenvs, saveGitenvs } from '~/gitenvs/gitenvs'
import { EnvFileType, Gitenvs } from '~/gitenvs/gitenvs.schema'
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
    .input(
      z.object({
        stages: z.array(
          z.object({
            name: z.string(),
          }),
        ),
        envFile: z.object({
          name: z.string(),
          filePath: z.string(),
          type: EnvFileType,
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const stages = await Promise.all(
        input.stages.map(async (stage) => {
          const keys = await createKeys()

          return {
            name: stage.name,
            ...keys,
          }
        }),
      )

      await saveGitenvs({
        version: '1',
        envStages: stages.map((stage) => ({
          name: stage.name,
          publicKey: stage.publicKey,
          encryptedPrivateKey: stage.privateKey,
        })),
        envFiles: [
          {
            ...input.envFile,
            id: randomUUID(),
          },
        ],
        envVars: [],
      })

      return {
        passphrases: stages.map((stage) => ({
          name: stage.name,
          passphrase: stage.passphrase,
        })),
      }
    }),
})
