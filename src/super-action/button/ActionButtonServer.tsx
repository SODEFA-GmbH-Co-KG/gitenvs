import { superAction } from '../action/createSuperAction'
import { ActionButton, type ActionButtonProps } from './ActionButton'

export const ActionButtonServer = (props: ActionButtonProps) => {
  return (
    <ActionButton
      {...props}
      action={async () => {
        'use server'
        return superAction(props.action)
      }}
    />
  )
}
