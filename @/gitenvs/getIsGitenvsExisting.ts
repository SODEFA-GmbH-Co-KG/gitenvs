import { getGitenvs } from './gitenvs'

export const getIsGitenvsExisting = async () => {
  try {
    await getGitenvs()
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
    return false
  }
}
