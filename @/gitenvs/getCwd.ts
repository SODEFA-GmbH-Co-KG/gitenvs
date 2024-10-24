import { GITENVS_DIR_ENV_NAME } from './env'

export const getCwd = () => {
  const cwd = `${process.env[GITENVS_DIR_ENV_NAME] ?? process.cwd()}`
  console.log({ cwd })

  return cwd
}
