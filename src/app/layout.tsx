import '~/styles/globals.css'
import { TrpcProvider } from '~/utils/TrpcProvider'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>
          <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
              {children}
            </div>
          </main>
        </TrpcProvider>
      </body>
    </html>
  )
}
