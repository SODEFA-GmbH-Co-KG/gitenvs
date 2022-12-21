// --- EnvConfig: gitenvs.config.json --- //

export type PointerOrValue =
  | {
      type: 'pointer'
      fileId: string
      stage: string
      key: string
    }
  | {
      type: 'value'
      value: string
      encrypted: boolean
    }

export type EnvVar = {
  // BASICS:
  fileId: string
  stage: string
  key: string

  // Just for DTO. All pointers resolved, funcs have been run & values are decrypted
  _value?: string
} & (
  | {
      type: 'func'
      func: {
        name: string
        params?: Record<string, PointerOrValue | PointerOrValue[]>
      }
    }
  | {
      type: 'content'
      content: PointerOrValue
    }
)

export type EnvFile = {
  fileId: string
  name: string
  path: string
  type:
    | 'dotenv'
    | 'typescript'
    // Can be used as a collection of variables. These variables can be reused in real files
    // `path` will be ignored.` TODO: Maybe we need better naming
    | 'variables'
    // Can be extended by extension file -> fileWriters
    | string
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
  // extensionsPath: string
}

// --- Extension File: gitenvs.extensions.js --- //

export type FuncContext<Params = Record<string, string | string[]>> = {
  params: Params
  currentEnvVar: EnvVar
}

export type Func<Input> = (options: {
  input: Input
  context: FuncContext
}) => Promise<string>

export type EnvFileWriter = (options: { TODO: any }) => Promise<string>

export type ExtensionFile = {
  funcs: {
    [funcName: string]: Func<any>
  }
  writers: {
    [writerName: string]: EnvFileWriter
  }
}
