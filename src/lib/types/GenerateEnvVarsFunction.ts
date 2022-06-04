import { EnvVars } from './EnvVars'

export type GenerateEnvVarsFunction<Stage extends string> = (options: {
  resolveSecret: (secret: string) => string | undefined
  stage: string
}) => EnvVars<Stage>
