'use client'

import { Button } from '@/components/ui/button'
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'
import {
  ActionWrapper,
  ActionWrapperProps,
  ActionWrapperSlotProps,
} from './ActionWrapper'
import { SuperIcon } from './SuperIcon'

export type ActionButtonProps = {
  hideIcon?: boolean
  hideButton?: boolean
  icon?: ReactNode
} & ActionWrapperProps &
  ComponentPropsWithoutRef<typeof Button>

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (props, ref) => {
    const {
      action,
      disabled,
      hideButton,
      catchToast = true,
      askForConfirmation,
      stopPropagation,
      command,
      icon,
      ...buttonProps
    } = props

    return (
      <>
        <ActionWrapper
          action={action}
          disabled={disabled}
          askForConfirmation={askForConfirmation}
          stopPropagation={stopPropagation}
          command={command}
          catchToast={catchToast}
          triggerOn={['onClick']}
          icon={icon}
        >
          {!hideButton && (
            <InnerButton icon={icon} {...buttonProps} ref={ref} />
          )}
        </ActionWrapper>
      </>
    )
  },
)

ActionButton.displayName = 'ActionButton'

const InnerButton = forwardRef<
  HTMLButtonElement,
  { hideIcon?: boolean; icon?: ReactNode } & ActionWrapperSlotProps
>(({ isLoading, children, hideIcon = true, icon, ...props }, ref) => {
  return (
    <Button type="button" {...props} ref={ref}>
      {children}
      {!hideIcon && (
        <SuperIcon icon={icon} className="ml-2" isLoading={isLoading} />
      )}
    </Button>
  )
})

InnerButton.displayName = 'InnerButton'
