import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  22,
)

export const getNewEnvFileId = () => {
  return `envFile_${nanoid()}`
}

export const getNewEnvVarId = () => {
  return `envVar_${nanoid()}`
}
