import { z } from 'zod'

export const Gitenvs = z.object({
  version: z.string(),
  envStages: z.array(
    z.object({
      name: z.string(),
      publicKey: z.string(),
      encryptedPrivateKey: z.string(),
    }),
  ),
  envFiles: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      filePath: z.string(),
      type: z.string(),
    }),
  ),
  envVars: z.array(
    z.object({
      fileId: z.string(),
      key: z.string(),
      values: z.record(
        z.string(),
        z.object({
          value: z.string(),
          encrypted: z.boolean(),
        }),
      ),
    }),
  ),
})
