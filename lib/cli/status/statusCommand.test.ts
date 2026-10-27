import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { type Gitenvs, type Passphrase } from '@/gitenvs/gitenvs.schema'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test } from 'vitest'
import { collectStatus } from './statusCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

test('collects secret-safe status metadata', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-status-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir

  const gitenvs = {
    version: '2',
    envStages: [
      {
        name: 'production',
        publicKey: 'public-key',
        encryptedPrivateKey: 'encrypted-private-key',
      },
    ],
    envFiles: [
      {
        id: 'envFile_6Gv71d0ZenuC9N39CeGz1c',
        name: '.env',
        filePath: '.env',
        type: 'dotenv',
      },
    ],
    envVars: [],
  } satisfies Gitenvs
  const passphrases = [
    {
      stageName: 'production',
      passphrase: 'very-secret',
    },
  ] satisfies Passphrase[]

  await writeFile(join(testDir, 'gitenvs.json'), JSON.stringify(gitenvs))
  await writeFile(
    join(testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases),
  )
  await writeFile(join(testDir, '.gitignore'), PASSPHRASE_FILE_NAME)

  const status = await collectStatus()

  expect(status.ok).toBe(true)
  expect(status.gitenvs.stages).toEqual(['production'])
  expect(status.ci.passphraseEnvByStage.production).toBe(
    'GITENVS_PASSPHRASE_PRODUCTION',
  )
  expect(JSON.stringify(status)).not.toContain('very-secret')
})

test('reports legacy configs without parsing them as current configs', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-status-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir

  const legacyGitenvs = {
    version: '1',
    envStages: [
      {
        name: 'production',
        publicKey: 'public-key',
        encryptedPrivateKey: 'encrypted-private-key',
      },
    ],
    envFiles: [
      {
        id: 'envFile_6Gv71d0ZenuC9N39CeGz1c',
        name: '.env',
        filePath: '.env',
        type: 'dotenv',
      },
    ],
    envVars: [
      {
        id: 'envVar_6Gv71d0ZenuC9N39CeGz1c',
        fileId: 'envFile_6Gv71d0ZenuC9N39CeGz1c',
        key: 'DATABASE_URL',
        values: {},
      },
    ],
  }
  const passphrases = [
    {
      stageName: 'production',
      passphrase: 'very-secret',
    },
  ] satisfies Passphrase[]

  await writeFile(join(testDir, 'gitenvs.json'), JSON.stringify(legacyGitenvs))
  await writeFile(
    join(testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases),
  )
  await writeFile(join(testDir, '.gitignore'), PASSPHRASE_FILE_NAME)

  const status = await collectStatus()

  expect(status.ok).toBe(false)
  expect(status.gitenvs.version).toBe(1)
  expect(status.gitenvs.latest).toBe(false)
  expect(status.gitenvs.stages).toEqual(['production'])
  expect(status.issues).toContain('gitenvs.json is not on the latest version')
  expect(JSON.stringify(status)).not.toContain('very-secret')
})

test('reports invalid current configs instead of crashing', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-status-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir

  const malformedGitenvs = {
    version: '2',
    envStages: [
      {
        name: 'production',
        publicKey: 'public-key',
        encryptedPrivateKey: 'encrypted-private-key',
      },
    ],
    envVars: [],
  }
  const passphrases = [
    {
      stageName: 'production',
      passphrase: 'very-secret',
    },
  ] satisfies Passphrase[]

  await writeFile(
    join(testDir, 'gitenvs.json'),
    JSON.stringify(malformedGitenvs),
  )
  await writeFile(
    join(testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases),
  )
  await writeFile(join(testDir, '.gitignore'), PASSPHRASE_FILE_NAME)

  const status = await collectStatus()

  expect(status.ok).toBe(false)
  expect(status.gitenvs.version).toBe(2)
  expect(status.gitenvs.latest).toBe(true)
  expect(status.gitenvs.stages).toEqual([])
  expect(status.gitenvs.envFiles).toEqual([])
  expect(status.issues).toContain('gitenvs.json is invalid')
  expect(JSON.stringify(status)).not.toContain('very-secret')
})
