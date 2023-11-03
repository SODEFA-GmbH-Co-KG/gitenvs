import { writeFile } from 'fs/promises'
import { z } from 'zod'
import { createKeys } from '~/gitenvs/createKeys'
import { getGitenvs, saveGitenvs } from '~/gitenvs/gitenvs'
import { CreateGitenvsJson, Gitenvs } from '~/gitenvs/gitenvs.schema'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { decryptWithEncryptionToken } from '~/utils/encryptionToken'

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
      // TODO: This should happen on the client, no passphrase should be sent to the client
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

      // TODO: Add .gitenvs.passphrase to .gitignore

      return {
        passphrases: stages.map((stage) => ({
          stageName: stage.name,
          passphrase: stage.passphrase,
        })),
      }
    }),
  savePassphraseToFolder: publicProcedure
    .input(
      z.object({
        encryptedPassphrase: z.object({
          encryptedValue: z.string(),
          iv: z.string(),
        }),
        stageName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const passphrase = await decryptWithEncryptionToken(
        input.encryptedPassphrase,
      )

      await writeFile(`${input.stageName}.gitenvs.passphrase`, passphrase)
    }),
})
