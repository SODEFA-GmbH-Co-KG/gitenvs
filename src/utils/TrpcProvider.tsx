'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { api, getTrpcConfig } from './api'

// FROM: https://trpc.io/docs/client/react/setup#4-add-trpc-providers
export const TrpcProvider = ({ children }: { children?: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({}))
  const [trpcClient] = useState(() => api.createClient(getTrpcConfig()))

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  )
}
