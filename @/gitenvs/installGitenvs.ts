import { installPackage } from '@antfu/install-pkg'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getProjectRoot } from './getProjectRoot'

export const installGitenvs = async () => {
  await installPackage('gitenvs', {
    dev: true,
    cwd: (await getProjectRoot()).projectRoot,
  })
}

export const getIsGitenvsInstalled = async () => {
  try {
    const { projectRoot } = await getProjectRoot()
    const packageJson = await readFile(
      join(projectRoot, 'package.json'),
      'utf-8',
    )
    const packageJsonParsed = JSON.parse(packageJson)
    const parsed = z
      .object({
        dependencies: z.record(z.string()).optional(),
        devDependencies: z.record(z.string()).optional(),
      })
      .parse(packageJsonParsed)
    return !!parsed.dependencies?.gitenvs || !!parsed?.devDependencies?.gitenvs
  } catch (error) {
    // Mild hack: If we can't read the package.json, we assume we aren't in a node project. True disables the install button.
    return true
  }
}
