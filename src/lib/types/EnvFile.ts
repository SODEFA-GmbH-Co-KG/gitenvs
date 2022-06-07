export type EnvValues<Stage extends string> = {
  [Key in Stage | 'default']?: string
}

export type EnvVar<Stage extends string> = {
  key: string
  values: EnvValues<Stage>
}

export type EnvFile<Stage extends string> = {
  envFilePath: string
  envVars: EnvVar<Stage>[]
}

export type ProcessedEnvFile = {
  envFilePath: string
  envVars: Array<{
    key: string
    value: string | undefined
  }>
}
