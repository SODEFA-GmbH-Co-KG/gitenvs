import { cn } from '@/lib/utils'
import { getGitenvs } from '~/gitenvs/gitenvs'

export const EnvFileSwitcher = async ({
  activeFileId,
}: {
  activeFileId: string
}) => {
  const gitenvs = await getGitenvs()

  return (
    <div className="flex flex-row gap-4">
      {gitenvs.envFiles.map((envFile) => {
        return (
          <div key={envFile.id}>
            <a
              href={`/file/${envFile.id}`}
              className={cn(
                'flex h-7 items-center justify-center rounded-full px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary',
                envFile.id === activeFileId && 'bg-muted text-primary',
              )}
            >
              {envFile.name}
            </a>
          </div>
        )
      })}
    </div>
  )
}
