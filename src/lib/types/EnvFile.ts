export type EnvValues<Stage extends string> = {
  [Key in Stage | 'default']?: string
}

export type EnvVar<Stage extends string> = {
  key: string
  values: EnvValues<Stage>
}

export type EnvFile<Stage extends string> = {
  envFilePath: string
  envType?: 'dotenv' | 'ts'
  envVars: EnvVar<Stage>[]
}

export type ProcessedEnvVar = {
  key: string
  value: string | undefined
}

export type ProcessedEnvFile = Omit<EnvFile<string>, 'envVars'> & {
  envVars: ProcessedEnvVar[]
}
