import { nanoid } from 'nanoid'

export const getNewEnvVarId = () => {
  return `envVar_${nanoid()}`
}
