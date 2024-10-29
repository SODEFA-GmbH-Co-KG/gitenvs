import { installPackage } from '@antfu/install-pkg'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getProjectRoot } from './getProjectRoot'

export const installGitenvs = async () => {
  await installPackage('gitenvs', {
    dev: true,
    cwd: await getProjectRoot(),
  })
}

export const getIsGitenvsInstalled = async () => {
  const projectRoot = await getProjectRoot()
  const packageJson = await readFile(join(projectRoot, 'package.json'), 'utf-8')
  const packageJsonParsed = JSON.parse(packageJson)
  const parsed = z
    .object({
      dependencies: z.record(z.string()).optional(),
      devDependencies: z.record(z.string()).optional(),
    })
    .parse(packageJsonParsed)
  return !!parsed.dependencies?.gitenvs || !!parsed?.devDependencies?.gitenvs
}
