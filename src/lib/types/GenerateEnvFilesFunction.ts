import { EnvFile } from './EnvFile'

export type GenerateEnvFilesFunction<Stage extends string> = (options: {
  resolveSecret: (secret: string) => string | undefined
  stage: string
}) => EnvFile<Stage>[]
