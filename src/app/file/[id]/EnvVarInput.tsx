import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { useState } from 'react'
import {
  type FieldArrayWithId,
  type UseFieldArrayReturn,
  type UseFormReturn,
} from 'react-hook-form'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'

export const EnvVarInput = ({
  field,
  stageName,
  index,
  form,
  fields,
}: {
  stageName: string
  index: number
  form: UseFormReturn<Gitenvs>
  field: FieldArrayWithId<Gitenvs, 'envVars', 'id'>
  fields: UseFieldArrayReturn<Gitenvs, 'envVars', 'id'>
}) => {
  const [showContent, setShowContent] = useState(false)

  const encrypted = field.values[stageName]?.encrypted ?? false

  return (
    <div className="flex flex-row gap-2">
      <Input
        key={`${field.id}-${stageName}`}
        className="flex flex-col gap-2"
        {...form.register(`envVars.${index}.values.${stageName}.value`)}
        type={showContent ? 'text' : 'password'}
      />
      <Toggle
        onPressedChange={(pressed) =>
          fields.update(index, {
            ...field,
            values: {
              ...field.values,
              [stageName]: {
                // TODO: Remove the `!`
                ...field.values[stageName]!,
                encrypted: pressed,
              },
            },
          })
        }
        pressed={encrypted}
      >
        {encrypted ? `🔒` : `🔓`}
      </Toggle>
      <Toggle onPressedChange={(pressed) => setShowContent(pressed)}>
        {showContent ? `👀` : `🙈`}
      </Toggle>
    </div>
  )
}
