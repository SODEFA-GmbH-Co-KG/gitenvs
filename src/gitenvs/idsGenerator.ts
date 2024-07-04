import { nanoid } from 'nanoid'

export const getNewEnvFileId = () => {
  return `envFile_${nanoid()}`
}

export const getNewEnvVarId = () => {
  return `envVar_${nanoid()}`
}
