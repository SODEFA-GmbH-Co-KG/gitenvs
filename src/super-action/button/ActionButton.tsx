'use client'

import { getCmdCtrlKey, KeyShortcut } from '@/components/KeyShortcut'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from 'react'
import { type ActionCommandConfig } from '../command/ActionCommandProvider'
import {
  ActionWrapper,
  type ActionWrapperProps,
  type ActionWrapperSlotProps,
} from './ActionWrapper'

export type ActionButtonProps = {
  children?: React.ReactNode
  hideIcon?: boolean
  hideButton?: boolean
  command?: Omit<
    ActionCommandConfig,
    'action' | 'children' | 'askForConfirmation'
  > & {
    label?: ReactNode
    hideKeyShortcut?: boolean
  }
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
        >
          {!hideButton && (
            <InnerButton command={command} {...buttonProps} ref={ref} />
          )}
        </ActionWrapper>
      </>
    )
  },
)

ActionButton.displayName = 'ActionButton'

const InnerButton = forwardRef<
  HTMLButtonElement,
  Pick<ActionButtonProps, 'command' | 'children' | 'hideIcon'> &
    ActionWrapperSlotProps
>(({ isLoading, children, hideIcon = true, command, ...props }, ref) => {
  const Icon = isLoading ? Loader2 : ArrowRight

  return (
    <Button type="button" {...props} ref={ref}>
      <div className="flex flex-row items-center gap-2">
        {children}
        {command?.hideKeyShortcut ?? !command?.shortcut?.key ? null : (
          <div className="flex flex-row items-center justify-center gap-1">
            {command?.shortcut?.shift && <KeyShortcut>Shift</KeyShortcut>}
            {command?.shortcut?.cmdCtrl && (
              <KeyShortcut>{getCmdCtrlKey()}</KeyShortcut>
            )}
            <KeyShortcut>{command?.shortcut?.key.toUpperCase()}</KeyShortcut>
          </div>
        )}
      </div>
      {!hideIcon && (
        <Icon className={cn('ml-2 h-4 w-4', isLoading && 'animate-spin')} />
      )}
    </Button>
  )
})

InnerButton.displayName = 'InnerButton'
