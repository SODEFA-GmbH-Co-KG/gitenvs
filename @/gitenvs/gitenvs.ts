import { existsSync, statSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { map, some } from 'lodash-es'
import { join } from 'path'
import { z } from 'zod'
import { getCwd } from './getCwd'
import { Gitenvs } from './gitenvs.schema'

export const latestGitenvsVersion = 2

export const getIsLatestGitenvsVersion = async () => {
  return (await getGitenvsVersion()) === latestGitenvsVersion
}

export const getGitenvsVersion = async () => {
  const gitenvsContent = await readFile(join(getCwd(), 'gitenvs.json'), 'utf-8')
  const gitenvs = z
    .object({ version: z.string() })
    .parse(JSON.parse(gitenvsContent))
  return parseInt(gitenvs.version)
}

export const checkGitenvsJsonExists = () => {
  return existsSync(join(getCwd(), 'gitenvs.json'))
}

export const getGitenvs = async () => {
  const gitenvsContent = await readFile(join(getCwd(), 'gitenvs.json'), 'utf-8')
  const gitenvs = Gitenvs.parse(JSON.parse(gitenvsContent))

  return gitenvs
}

export const checkShouldRegenerateEnvFiles = async () => {
  const gitenvs = await getGitenvs()
  const gitenvsFileInfo = statSync(join(getCwd(), 'gitenvs.json'))
  const updatedAt = gitenvsFileInfo.mtime
  const envFileRegenerateInfos = map(gitenvs.envFiles, (envFile) => {
    const isExisting = existsSync(join(getCwd(), envFile.filePath))
    if (!isExisting) {
      return {
        shouldRegenerate: true,
      }
    }
    const envFileInfo = statSync(join(getCwd(), envFile.filePath))
    return {
      shouldRegenerate: envFileInfo.mtime < updatedAt,
    }
  })
  return some(envFileRegenerateInfos, (info) => info.shouldRegenerate)
}

export const saveGitenvs = async (gitenvs: Gitenvs) => {
  const path = join(getCwd(), 'gitenvs.json')
  const isValid = Gitenvs.safeParse(gitenvs)
  if (!isValid.success) {
    throw new Error(isValid.error.message)
  }
  await writeFile(path, JSON.stringify(gitenvs, null, 2))
}
