import { redirect } from 'next/navigation'
import { getIsGitenvsExisting } from '~/gitenvs/getIsGitenvsExisting'
import { getGitenvs } from '~/gitenvs/gitenvs'

export const Main = async () => {
  const isGitenvsExisting = await getIsGitenvsExisting()

  if (!isGitenvsExisting) {
    return redirect('/setup')
  }

  const gitenvs = await getGitenvs()
  const envFile = gitenvs.envFiles.at(0)

  if (!envFile) {
    // TODO: Autofix this
    throw new Error('No env file found')
  }

  return redirect(`/file/${envFile.id}`)
}
