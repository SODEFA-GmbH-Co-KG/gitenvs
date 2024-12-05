'use client'

import { useSetAtom } from 'jotai'
import { useId, useLayoutEffect } from 'react'
import {
  type ActionCommandConfig,
  actionCommandsAtom,
} from './ActionCommandProvider'

export const ActionCommandClient = <Result,>(
  props: ActionCommandConfig<Result>,
) => {
  useRegisterActionCommand({
    command: props,
  })
  return null
}

const useRegisterActionCommand = <Result,>({
  command,
}: {
  command: ActionCommandConfig<Result>
}) => {
  const id = useId()
  const setCommands = useSetAtom(actionCommandsAtom)

  useLayoutEffect(() => {
    setCommands((prev) => ({ ...prev, [id]: command }))
    return () => {
      setCommands((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prev
        return rest
      })
    }
  })
}
