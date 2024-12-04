import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { getGitenvs } from '@/gitenvs/gitenvs'

export default async function Page() {
  const gitenvs = await getGitenvs()

  return (
    <div className="container flex flex-col gap-2">
      <EnvFileSwitcher gitenvs={gitenvs} />
    </div>
  )
}
