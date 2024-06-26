import {
  createContext,
  useContext,
  type FunctionComponent,
  type PropsWithChildren,
} from 'react'
import { api } from '~/utils/api'

const useGitenvsContextState = () => {
  const { data: gitenvs } = api.gitenvs.getGitenvs.useQuery(undefined, {})
  const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()

  return {
    gitenvs,
    saveGitenvs,
  }
}

type IGitenvsContext = ReturnType<typeof useGitenvsContextState>

export const GitenvsContext = createContext({} as IGitenvsContext)

export const GitenvsContextProvider: FunctionComponent<
  PropsWithChildren<object>
> = ({ children }) => {
  const context = useGitenvsContextState()
  return (
    <GitenvsContext.Provider value={context}>
      {children}
    </GitenvsContext.Provider>
  )
}

export const useGitenvsContext = () => {
  return useContext(GitenvsContext)
}
