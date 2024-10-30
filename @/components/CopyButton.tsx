import { Copy } from 'lucide-react'
import { ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export const CopyButton = ({
  textToCopy,
  additionalText,
  className, // TODO: Use proper HTML attributes
  icon,
  tooltip = 'Copy to clipboard',
}: {
  textToCopy: string
  additionalText?: string
  className?: string
  icon?: ReactNode
  tooltip?: ReactNode
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={className}
            variant="outline"
            onClick={async () => {
              toast.promise(navigator.clipboard.writeText(textToCopy), {
                success: 'Copied to clipboard',
                error: 'Could not copy to clipboard',
              })
            }}
          >
            {icon ?? <Copy className="h-4 w-4" />}
            {additionalText && <>&nbsp; {additionalText}</>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
