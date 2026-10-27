import { type EnvVar } from './gitenvs.schema'
import { getNewEnvVarId } from './idsGenerator'

export const createEnvVar = ({
  fileIds,
  key,
  values = {},
}: {
  fileIds: string[]
  key: string
  values?: EnvVar['values']
}) => {
  return {
    id: getNewEnvVarId(),
    fileIds,
    key,
    values,
  } satisfies EnvVar
}
