'use client'

import {
  useSuperAction,
  type UseSuperActionOptions,
} from '../action/useSuperAction'

export type ActionFormProps = {
  children?: React.ReactNode
  className?: string
} & UseSuperActionOptions

export const ActionForm = ({
  children,
  className,
  ...superActionOptions
}: ActionFormProps) => {
  const { isLoading, trigger } = useSuperAction(superActionOptions)
  return (
    <form
      className={className}
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.target
        if (!(form instanceof HTMLFormElement)) return
        const formData = new FormData(form)
        await trigger(formData)
      }}
    >
      {children}
    </form>
  )
}
