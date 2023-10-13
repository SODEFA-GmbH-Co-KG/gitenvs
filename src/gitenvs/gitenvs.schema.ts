import { z } from 'zod'

export const Gitenvs = z.object({
  version: z.string(),
  stages: z.array(
    z.object({
      name: z.string(),
      publicKey: z.string(),
      encryptedPrivateKey: z.string(),
    }),
  ),
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      filePath: z.string(),
      type: z.string(),
    }),
  ),
  vars: z.array(
    z.object({
      fileId: z.string(),
      key: z.string(),
      value: z.string(),
      stage: z.string(),
      encrypted: z.boolean(),
    }),
  ),
})
