import { Toaster } from 'sonner'
import '~/styles/globals.css'
import { TrpcProvider } from '~/utils/TrpcProvider'
import { Providers } from './providers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>
          <Providers>
            <main className="flex min-h-screen flex-col items-center justify-center">
              <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                {children}
              </div>
            </main>
            <Toaster />
          </Providers>
        </TrpcProvider>
      </body>
    </html>
  )
}
