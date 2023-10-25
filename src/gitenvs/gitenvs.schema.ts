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

export const EnvFileType = z.enum(['dotenv'])

export const EnvFile = z.object({
  id: z.string(),
  name: z.string(),
  filePath: z.string(),
  type: EnvFileType,
})

export const EnvStage = z.object({
  name: z.string(),
  publicKey: z.string(),
  encryptedPrivateKey: z.string(),
})

export const Gitenvs = z.object({
  version: z.string(),
  envStages: z.array(EnvStage),
  envFiles: z.array(EnvFile),
  envVars: z.array(EnvVar),
})

export type Gitenvs = z.infer<typeof Gitenvs>

export const CreateGitenvsJson = z.object({
  envFile: EnvFile.omit({ id: true }),
  envStages: z.array(
    EnvStage.omit({ publicKey: true, encryptedPrivateKey: true }),
  ),
})
