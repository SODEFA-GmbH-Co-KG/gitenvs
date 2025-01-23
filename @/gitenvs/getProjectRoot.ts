import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { z } from 'zod'
import { getCwd } from './getCwd'

export const getProjectRoot = async () => {
  let cwd = getCwd()
  while (true) {
    const foundPackageJson = await readFile(join(cwd, 'package.json'), 'utf-8')
      .then(() => true)
      .catch((error: unknown) => {
        const errorObject = z.object({ code: z.string() }).parse(error)
        if (errorObject.code === 'ENOENT') {
          return false
        }
        throw error
      })

    if (foundPackageJson) {
      return { projectRoot: cwd, foundPackageJson: true }
    }

    if (cwd === '/') {
      // If we've reached the root, there is no package.json that defines the project root. We use the current directory as the project root.
      return { projectRoot: getCwd(), foundPackageJson: false }
    }

    cwd = dirname(cwd)
  }
}
