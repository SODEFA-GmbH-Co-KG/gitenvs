import { z } from 'zod'

export const EnvVarValue = z.object({
  value: z.string(),
  encrypted: z.boolean(),
  isFunction: z.boolean().optional(),
})

export type EnvVarValue = z.infer<typeof EnvVarValue>

export const EnvVar = z.object({
  id: z.string(),
  fileIds: z.array(z.string()),
  key: z.string(),
  values: z.record(z.string(), EnvVarValue),
})

export type EnvVar = z.infer<typeof EnvVar>

export const EnvFileType = z.enum(['dotenv', '.ts'])

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
  version: z.enum(['2']),
  envStages: z.array(EnvStage),
  envFiles: z.array(EnvFile),
  envVars: z.array(EnvVar),
})

/** @deprecated */
export const Gitenvs1 = z.object({
  version: z.enum(['1']),
  envStages: z.array(EnvStage),
  envFiles: z.array(EnvFile),
  envVars: z.array(
    z.object({
      id: z.string(),
      fileId: z.string(),
      key: z.string(),
      values: z.record(z.string(), EnvVarValue),
    }),
  ),
})

export type Gitenvs = z.infer<typeof Gitenvs>

export const Passphrase = z.object({
  stageName: z.string(),
  passphrase: z.string(),
})

export type Passphrase = z.infer<typeof Passphrase>
