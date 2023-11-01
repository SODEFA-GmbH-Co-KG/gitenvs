import { Copy } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'

export const WithCopyButton = ({
  children,
  textToCopy,
}: React.PropsWithChildren<{ textToCopy: string }>) => {
  return (
    <div className="flex flex-row gap-4 flex-1">
      {children}
      <Button
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(textToCopy)
        }}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  )
}
