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

export type EnvVar = z.infer<typeof EnvVar>

export const EnvFileType = z.enum(['dotenv'])

export type EnvFileType = z.infer<typeof EnvFileType>

export const EnvFile = z.object({
  id: z.string(),
  name: z.string(),
  filePath: z.string(),
  type: EnvFileType,
})

export type EnvFile = z.infer<typeof EnvFile>

export const EnvStage = z.object({
  name: z.string(),
  publicKey: z.string(),
  encryptedPrivateKey: z.string(),
})

export type EnvStage = z.infer<typeof EnvStage>

export const Gitenvs = z.object({
  version: z.string(),
  envStages: z.array(EnvStage),
  envFiles: z.array(EnvFile),
  envVars: z.array(EnvVar),
})

export type Gitenvs = z.infer<typeof Gitenvs>

export const Passphrase = z.object({
  stageName: z.string(),
  passphrase: z.string(),
})

export type Passphrase = z.infer<typeof Passphrase>
