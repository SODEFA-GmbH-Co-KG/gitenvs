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
  try {
    const packageJson = await getPackageJson()
    return packageJson.scripts?.gitenvs === COMMAND
  } catch (error) {
    // Mild hack: If we can't read the package.json, we assume we aren't in a node project. True disables the install button.
    return true
  }
}
