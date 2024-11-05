import { ArrowTab } from '@/components/ArrowTab'
import { HandlePastePassphrase } from '@/components/HandlePastePassphrase'
import { SendEncryptedPassphrasesToClient } from '@/components/SendEncryptedPassphrasesToClient'
import { Toaster } from '@/components/ui/toaster'
import { type Metadata } from 'next'
import { Toaster as ToasterSonner } from 'sonner'
import '~/styles/globals.css'
import { ActionCommandProvider } from '~/super-action/command/ActionCommandProvider'
import { DialogProvider } from '~/super-action/dialog/DialogProvider'
import { EncryptionTokenSideEffect } from '~/utils/encryptionKeyOnClient'
import { Providers } from './providers'

export const revalidate = 0

export const metadata: Metadata = {
  title: {
    default: 'Gitenvs',
    template: '%s | Gitenvs',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="flex min-h-screen flex-col items-center">
            <div className="container flex flex-col items-center gap-12 px-4 pb-16 pt-16">
              {children}
            </div>
          </main>
          <ArrowTab />
          <ActionCommandProvider />
          <DialogProvider />
          <Toaster />
          <ToasterSonner />
          <EncryptionTokenSideEffect />
          <SendEncryptedPassphrasesToClient />
          <HandlePastePassphrase />
        </Providers>
      </body>
    </html>
  )
}
