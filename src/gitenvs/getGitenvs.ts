import { readFile } from 'fs/promises'
import { join } from 'path'
import { Gitenvs } from './gitenvs.schema'

export const getGitenvs = async () => {
  const gitenvsContent = await readFile(
    join(process.cwd(), 'gitenvs.json'),
    'utf-8',
  )
  const gitenvs = Gitenvs.parse(JSON.parse(gitenvsContent))
  return gitenvs
}
