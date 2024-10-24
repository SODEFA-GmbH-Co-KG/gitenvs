import { type EnvVarValue } from '@/gitenvs/gitenvs.schema'

export const TableEnvVarTag = ({
  envVarValue,
}: {
  envVarValue?: EnvVarValue
}) => {
  if (!envVarValue || envVarValue.value === '') {
    return (
      <span className="rounded-sm bg-gray-600 p-1 text-xs uppercase">
        Empty
      </span>
    )
  }

  if (envVarValue.encrypted) {
    return (
      <span className="rounded-sm bg-primary p-1 text-xs uppercase text-black">
        Encrypted
      </span>
    )
  }

  return envVarValue.value
}
