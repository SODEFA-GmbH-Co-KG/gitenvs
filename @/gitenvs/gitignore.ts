import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { BACKUP_DIR_NAME, PASSPHRASE_FILE_NAME } from './getPassphrase'
import { getProjectRoot } from './getProjectRoot'

const getGitIgnorePath = async () =>
  join((await getProjectRoot()).projectRoot, '.gitignore')

const GITENVS_IGNORE_PATTERN = PASSPHRASE_FILE_NAME

export const updateGitIgnore = async () => {
  await addToGitIgnore(GITENVS_IGNORE_PATTERN)
}

// backups contain old passphrases and must never be committed
export const addBackupDirToGitIgnore = async () => {
  await addToGitIgnore(`${BACKUP_DIR_NAME}/`)
}

const addToGitIgnore = async (pattern: string) => {
  const currentIgnore = await readFile(await getGitIgnorePath(), 'utf-8').catch(
    (error: unknown) => {
      const errorObject = z.object({ code: z.string() }).parse(error)
      if (errorObject.code === 'ENOENT') {
        return ''
      }
      throw error
    },
  )

  if (currentIgnore.includes(pattern)) {
    return
  }

  await writeFile(
    await getGitIgnorePath(),
    `${currentIgnore ? `${currentIgnore}\n\n` : ''}# gitenvs\n${pattern}`,
  )
}

export const getIsGitignoreExisting = async () => {
  try {
    await readFile(await getGitIgnorePath(), 'utf-8')
    return true
  } catch (error) {
    return false
  }
}

export const getIsGitenvsInGitIgnore = async () => {
  if (!(await getIsGitignoreExisting())) {
    return false
  }
  const gitignore = await readFile(await getGitIgnorePath(), 'utf-8')
  return gitignore.includes(GITENVS_IGNORE_PATTERN)
}
