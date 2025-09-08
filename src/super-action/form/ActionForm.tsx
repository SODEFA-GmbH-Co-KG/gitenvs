'use client'

import {
  useSuperAction,
  type UseSuperActionOptions,
} from '../action/useSuperAction'

export type ActionFormProps = {
  children?:
    | React.ReactNode
    | ((props: { isLoading: boolean }) => React.ReactNode)
  className?: string
} & UseSuperActionOptions<void, FormData>

export const ActionForm = ({
  children,
  className,
  ...superActionOptions
}: ActionFormProps) => {
  const { trigger, isLoading } = useSuperAction(superActionOptions)
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
      {typeof children === 'function' ? children({ isLoading }) : children}
    </form>
  )
}
