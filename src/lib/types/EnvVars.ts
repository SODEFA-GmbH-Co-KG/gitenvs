export type EnvVars<Stage extends string> = Array<{
  key: string
  envFiles: string[]
  values: { [Key in Stage | 'default']?: string }
}>
