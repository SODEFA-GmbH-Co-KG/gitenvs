import { z } from 'zod'

export const EnvVar = z.object({
  fileId: z.string(),
  key: z.string(),
  values: z.record(
    z.string(),
    z.object({
      value: z.string(),
      encrypted: z.boolean(),
    }),
  ),
})

export const EnvFileType = z.enum(['.env'])

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
      type: EnvFileType,
    }),
  ),
  envVars: z.array(EnvVar),
})

export type Gitenvs = z.infer<typeof Gitenvs>
