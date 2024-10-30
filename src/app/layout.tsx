import { ArrowTab } from '@/components/ArrowTab'
import { SendEncryptedPassphrasesToClient } from '@/components/SendEncryptedPassphrasesToClient'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as ToasterSonner } from 'sonner'
import '~/styles/globals.css'
import { ActionCommandProvider } from '~/super-action/command/ActionCommandProvider'
import { DialogProvider } from '~/super-action/dialog/DialogProvider'
import { EncryptionTokenSideEffect } from '~/utils/encryptionKeyOnClient'
import { Providers } from './providers'
import { HandlePastePassphrase } from '@/components/HandlePastePassphrase'

export const revalidate = 0

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
            <div className="container flex flex-col items-center gap-12 px-4 pb-16 pt-40">
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
