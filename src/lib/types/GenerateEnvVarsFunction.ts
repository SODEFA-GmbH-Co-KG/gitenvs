import { EnvFile } from './EnvVars'

export type GenerateEnvVarsFunction<Stage extends string> = (options: {
  resolveSecret: (secret: string) => string | undefined
  stage: string
}) => EnvFile<Stage>[]
