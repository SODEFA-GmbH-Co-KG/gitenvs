'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import NiceModal from '@ebay/nice-modal-react'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NiceModal.Provider>
      <TooltipProvider>{children}</TooltipProvider>
    </NiceModal.Provider>
  )
}
