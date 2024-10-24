import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { redirect } from 'next/navigation'

export const Main = async () => {
  const isGitenvsExisting = await getIsGitenvsExisting()

  if (!isGitenvsExisting) {
    return redirect('/setup/init')
  }

  const gitenvs = await getGitenvs()
  const envFile = gitenvs.envFiles.at(0)

  if (!envFile) {
    // TODO: Autofix this
    throw new Error('No env file found')
  }

  return redirect(`/file/${envFile.id}`)
}
