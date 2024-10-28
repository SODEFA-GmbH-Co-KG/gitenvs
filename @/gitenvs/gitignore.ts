import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getCwd } from './getCwd'

const getGitIgnorePath = () => join(getCwd(), '.gitignore')

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

  if (currentIgnore.includes('*.gitenvs.passphrase')) {
    return
  }

  await writeFile(
    getGitIgnorePath(),
    `${currentIgnore ? `${currentIgnore}\n\n` : ''}#gitenvs\n*.gitenvs.passphrase`,
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
