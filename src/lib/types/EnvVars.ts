export type EnvValues<Stage extends string> = {
  [Key in Stage | 'default']?: string
}

export type EnvVar<Stage extends string> = {
  key: string
  values: EnvValues<Stage>
}

export type EnvFile<Stage extends string> = {
  envFile: string
  envVars: EnvVar<Stage>[]
}

export type EnvVars<Stage extends string> = Array<
  EnvVar<Stage> & {
    envFiles: string[]
  }
>
