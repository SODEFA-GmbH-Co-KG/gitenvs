import { getGitenvs } from '~/gitenvs/gitenvs'

export const EnvFileSwitcher = async () => {
  const gitenvs = await getGitenvs()

  return (
    <div className="flex flex-row gap-4">
      {gitenvs.envFiles.map((envFile) => {
        return (
          <div key={envFile.id}>
            <a
              href={`/file/${envFile.id}`}
              className="flex h-7 items-center justify-center rounded-full bg-muted px-4 text-center text-sm font-medium text-primary transition-colors hover:text-primary"
            >
              {envFile.name}
            </a>
          </div>
        )
      })}
    </div>
  )
}
