import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { redirect } from 'next/navigation'

export const Main = async () => {
  const isGitenvsExisting = await getIsGitenvsExisting()

  if (!isGitenvsExisting) {
    return redirect('/setup')
  }

  const gitenvs = await getGitenvs()
  const envFile = gitenvs.envFiles.at(0)

  if (!envFile) {
    redirect('/file/new')
  }

  return redirect(`/file/${envFile.id}`)
}
