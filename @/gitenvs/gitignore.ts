import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getCwd } from './getCwd'

const getGitIgnorePath = () => join(getCwd(), '.gitignore')

const GITENVS_IGNORE_PATTERN = '*.gitenvs.passphrase'

export const updateGitIgnore = async () => {
  const currentIgnore = await readFile(getGitIgnorePath(), 'utf-8').catch(
    (error: unknown) => {
      const errorObject = z.object({ code: z.string() }).parse(error)
      if (errorObject.code === 'ENOENT') {
        return ''
      }
      throw error
    },
  )

  if (currentIgnore.includes(GITENVS_IGNORE_PATTERN)) {
    return
  }

  await writeFile(
    getGitIgnorePath(),
    `${currentIgnore ? `${currentIgnore}\n\n` : ''}# gitenvs\n${GITENVS_IGNORE_PATTERN}`,
  )
}

export const getIsGitignoreExisting = async () => {
  try {
    await readFile(getGitIgnorePath(), 'utf-8')
    return true
  } catch (error) {
    return false
  }
}

export const getIsGitenvsInGitIgnore = async () => {
  if (!(await getIsGitignoreExisting())) {
    return false
  }
  const gitignore = await readFile(getGitIgnorePath(), 'utf-8')
  return gitignore.includes(GITENVS_IGNORE_PATTERN)
}
