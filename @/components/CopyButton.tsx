import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'

export const CopyButton = ({
  textToCopy,
  additionalText,
}: {
  textToCopy: string
  additionalText?: string
}) => {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        toast.promise(navigator.clipboard.writeText(textToCopy), {
          success: 'Copied to clipboard',
          error: 'Could not copy to clipboard',
        })
      }}
    >
      <Copy className="w-4 h-4" />
      {additionalText && <>&nbsp; {additionalText}</>}
    </Button>
  )
}
