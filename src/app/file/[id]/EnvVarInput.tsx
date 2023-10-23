import { Input } from '@/components/ui/input'
import { UseFormReturn } from 'react-hook-form'
import { Gitenvs } from '~/gitenvs/gitenvs.schema'

export const EnvVarInput = ({
  fieldId,
  stageName,
  index,
  form,
}: {
  fieldId: string
  stageName: string
  index: number
  form: UseFormReturn<Gitenvs>
}) => {
  return (
    <Input
      key={`${fieldId}-${stageName}`}
      className="flex flex-col gap-2"
      {...form.register(`envVars.${index}.values.${stageName}.value`)}
    />
  )
}
