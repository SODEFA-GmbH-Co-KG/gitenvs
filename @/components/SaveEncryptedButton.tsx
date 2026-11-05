import { Button } from '@/components/ui/button'
import { KeyShortcut } from './KeyShortcut'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export const SaveEncryptedButton = ({
  isFunction,
  disabled,
  onClick,
}: {
  isFunction: boolean
  disabled?: boolean
  onClick: () => unknown
}) => {
  const button = (
    <Button
      type="button"
      disabled={isFunction || disabled}
      onClick={onClick}
      className="flex flex-row gap-2"
    >
      <span>Save encrypted</span>
      <KeyShortcut>Enter</KeyShortcut>
    </Button>
  )

  if (!isFunction) return button

  // Own provider, because dialogs opened with NiceModal render outside of the app's provider
  return (
    <TooltipProvider>
      <Tooltip>
        {/* Disabled buttons don't fire hover events, so the wrapper triggers the tooltip */}
        <TooltipTrigger asChild>
          <span tabIndex={0} className="flex flex-col">
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            Functions can&apos;t be encrypted. Their code runs when the env
            files are created, so it has to stay visible in code review.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
