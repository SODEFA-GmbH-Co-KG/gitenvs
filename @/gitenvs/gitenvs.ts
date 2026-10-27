import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getCwd } from './getCwd'
import { Gitenvs } from './gitenvs.schema'

export const latestGitenvsVersion = 2

export const GITENVS_README =
  'This file is managed by gitenvs – do not edit manually. To add or update an env var, run `npx gitenvs@latest set --file <filePath> --key <KEY> --value <VALUE>` (encrypted by default; AI-agent friendly, no passphrase needed). Open the UI with `npx gitenvs@latest`. Docs: https://github.com/SODEFA-GmbH-Co-KG/gitenvs'

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

export const saveGitenvs = async (gitenvs: Gitenvs) => {
  const path = join(getCwd(), 'gitenvs.json')
  const isValid = Gitenvs.safeParse(gitenvs)
  if (!isValid.success) {
    throw new Error(isValid.error.message)
  }
  const { _readme: _stripped, ...rest } = gitenvs as Gitenvs & {
    _readme?: string
  }
  const toWrite = { _readme: GITENVS_README, ...rest }
  await writeFile(path, JSON.stringify(toWrite, null, 2))
}
