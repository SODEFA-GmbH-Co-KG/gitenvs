import { getGitenvs } from './gitenvs'

export const getIsGitenvsExisting = async () => {
  try {
    await getGitenvs()
    return true
  } catch (error) {
    return false
  }
}
