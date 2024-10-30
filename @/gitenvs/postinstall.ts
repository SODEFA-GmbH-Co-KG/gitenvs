import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getProjectRoot } from './getProjectRoot'

const POSTINSTALL_SCRIPT = 'gitenvs create'

const getPackageJsonPath = async () => {
  const projectRoot = await getProjectRoot()
  return join(projectRoot, 'package.json')
}

const getPackageJson = async () => {
  const packageJson = await readFile(await getPackageJsonPath(), 'utf-8')
  const json = JSON.parse(packageJson)
  const parsed = z
    .object({
      scripts: z.record(z.string()).optional(),
    })
    .passthrough()
    .parse(json)
  return parsed
}

export const updatePostInstall = async () => {
  const packageJson = await getPackageJson()
  const existing = packageJson.scripts?.postinstall ?? ''
  if (packageJson.scripts?.postinstall) {
    return
  }
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }
  packageJson.scripts = {
    ...(packageJson.scripts ?? {}),
    postinstall: `${existing ? `${existing} && ` : ''}${POSTINSTALL_SCRIPT}`,
  }
  await writeFile(
    await getPackageJsonPath(),
    JSON.stringify(packageJson, null, 2),
  )
}

export const getIsPostInstallScriptExisting = async () => {
  const packageJson = await getPackageJson()
  return packageJson.scripts?.postinstall?.includes(POSTINSTALL_SCRIPT)
}
