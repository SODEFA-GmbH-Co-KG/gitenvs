import { writeFile } from 'fs/promises'
import { getPackageJson, getPackageJsonPath } from './postinstall'

const COMMAND = 'gitenvs'

export const addToScripts = async () => {
  const packageJson = await getPackageJson()
  packageJson.scripts = {
    ...(packageJson.scripts ?? {}),
    gitenvs: COMMAND,
  }
  await writeFile(
    await getPackageJsonPath(),
    JSON.stringify(packageJson, null, 2),
  )
}

export const getIsAddedToScripts = async () => {
  const packageJson = await getPackageJson()
  return packageJson.scripts?.gitenvs === COMMAND
}
