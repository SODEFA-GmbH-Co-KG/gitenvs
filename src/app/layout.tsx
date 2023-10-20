import { cn } from '@/lib/utils'
import Link from 'next/link'
import { getGitenvs } from '~/gitenvs/getGitenvs'
import '~/styles/globals.css'
import { TrpcProvider } from '~/utils/TrpcProvider'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gitenvs = await getGitenvs()

  return (
    <html lang="en">
      <body>
        <TrpcProvider>
          <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                {gitenvs.envFiles.map((file) => (
                  <Link
                    href={`/file/${file.id}`}
                    key={file.id}
                    // value={file.id}
                    className={cn(
                      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-background hover:text-foreground hover:shadow-sm',
                    )}
                  >
                    {file.name}
                  </Link>
                ))}
              </div>
              {children}
            </div>
          </main>
        </TrpcProvider>
      </body>
    </html>
  )
}
