import { type EnvVarValue } from '@/gitenvs/gitenvs.schema'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const TableEnvVarTag = ({
  envVarValue,
  showValue,
}: {
  envVarValue?: EnvVarValue
  showValue: boolean
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
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate rounded-sm bg-primary p-1 text-xs text-black">
            {showValue ? envVarValue.value : 'ENCRYPTED'}
          </span>
        </TooltipTrigger>
        {showValue ? (
          <TooltipContent>{envVarValue.value}</TooltipContent>
        ) : null}
      </Tooltip>
    )
  }

  return envVarValue.value
}
