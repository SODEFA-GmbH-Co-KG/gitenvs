import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { getCwd } from './getCwd'
import { Gitenvs } from './gitenvs.schema'

export const getGitenvs = async () => {
  const gitenvsContent = await readFile(join(getCwd(), 'gitenvs.json'), 'utf-8')
  const gitenvs = Gitenvs.parse(JSON.parse(gitenvsContent))
  return gitenvs
}

export const saveGitenvs = async (gitenvs: Gitenvs) => {
  await writeFile(
    join(getCwd(), 'gitenvs.json'),
    JSON.stringify(gitenvs, null, 2),
  )
}
