import { writeFile } from 'fs/promises'
import { z } from 'zod'
import { getIsGitenvsExisting } from '~/gitenvs/getIsGitenvsExisting'
import { getGitenvs, saveGitenvs } from '~/gitenvs/gitenvs'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { decryptWithEncryptionToken } from '~/utils/encryptionToken'
import { getEncryptionKeyOnServer } from '~/utils/getEncryptionKeyOnServer'

export const gitenvsRouter = createTRPCRouter({
  getGitenvs: publicProcedure.query(async () => {
    const gitenvs = await getGitenvs()
    return gitenvs
  }),
  gitenvsJsonExists: publicProcedure.query(async () => {
    return getIsGitenvsExisting()
  }),
  createGitenvs: publicProcedure.input(Gitenvs).mutation(async ({ input }) => {
    await saveGitenvs(input)
    // TODO: Add .gitenvs.passphrase to .gitignore
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
      const passphrase = await decryptWithEncryptionToken({
        ...input.encryptedPassphrase,
        key: await getEncryptionKeyOnServer(),
      })

      await writeFile(`${input.stageName}.gitenvs.passphrase`, passphrase)
    }),
})
