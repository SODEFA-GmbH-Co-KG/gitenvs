import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { type Gitenvs, type Passphrase } from '@/gitenvs/gitenvs.schema'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { mkdtemp, readFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { setupCommand } from './setupCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]
  vi.restoreAllMocks()

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

test('sets up gitenvs files without provider-specific integrations', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-setup-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir
  vi.spyOn(console, 'log').mockImplementation(() => undefined)

  await setupCommand({
    stages: 'development,production',
    file: '.env.local',
    fileName: 'Local env',
    fileType: 'dotenv',
    force: false,
    gitignore: true,
    install: false,
    postinstall: false,
    scripts: false,
    yes: true,
  })

  const gitenvs = JSON.parse(
    await readFile(join(testDir, 'gitenvs.json'), 'utf-8'),
  ) as Gitenvs
  const passphrases = JSON.parse(
    await readFile(join(testDir, PASSPHRASE_FILE_NAME), 'utf-8'),
  ) as Passphrase[]
  const gitignore = await readFile(join(testDir, '.gitignore'), 'utf-8')

  expect(gitenvs.envStages.map((stage) => stage.name)).toEqual([
    'development',
    'production',
  ])
  for (const passphrase of passphrases) {
    expect(JSON.stringify(gitenvs)).not.toContain(passphrase.passphrase)
  }
  expect(gitenvs.envFiles).toMatchObject([
    {
      name: 'Local env',
      filePath: '.env.local',
      type: 'dotenv',
    },
  ])
  expect(passphrases).toHaveLength(2)
  expect(passphrases.map((passphrase) => passphrase.stageName)).toEqual([
    'development',
    'production',
  ])
  expect(gitignore).toContain(PASSPHRASE_FILE_NAME)
})
