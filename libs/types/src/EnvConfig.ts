export type EnvVar = {
  // BASICS:
  fileId: string
  stage: string
  key: string

  // POINTER:
  pointer?: {
    fileId?: string
    stage?: string
    key?: string
  }

  // FUNCTION:
  // Function params are saved in `value`. They can be saved as JSON or if it is a single value as a string.
  funcName?: string

  encrypted?: boolean
  value?: string
  // Just for DTO
  _valueDecrypted?: string
}

export type EnvFile = {
  fileId: string
  path: string
  type: 'dotenv' | 'typescript'
}

export type EnvStage = {
  name: string
  publicKey: string
  encryptedPrivateKey: string
}

export type EnvConfig = {
  version: 1
  envVars: EnvVar[]
  files: EnvFile[]
  stages: EnvStage[]
}

export type FuncContext = {
  envConfig: EnvConfig
  // Decrypts / follows the pointer / executes the function
  resolve: (envVar: EnvVar) => Promise<string>
}

export type Func<Input> = (options: {
  input: Input
  ctx: FuncContext
}) => Promise<string>

export type FuncFile = {
  [funcName: string]: Func<any>
}
