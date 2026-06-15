import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { setCommand } from './setCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]
  delete process.env.SECRET_SOURCE
  vi.restoreAllMocks()

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

test('creates new env vars with envVar ids', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-set-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir

  const gitenvs = {
    version: '2',
    envStages: [
      {
        name: 'development',
        publicKey: '',
        encryptedPrivateKey: '',
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

  await writeFile(
    join(testDir, 'gitenvs.json'),
    JSON.stringify(gitenvs, null, 2),
  )
  vi.spyOn(console, 'log').mockImplementation(() => undefined)

  await setCommand({
    file: '.env',
    key: 'API_KEY',
    value: 'secret',
    valueStdin: false,
    stage: 'development',
    encrypt: false,
  })

  const saved = JSON.parse(
    await readFile(join(testDir, 'gitenvs.json'), 'utf-8'),
  ) as Gitenvs

  expect(saved.envVars).toHaveLength(1)
  expect(saved.envVars[0]?.id).toMatch(/^envVar_/)
  expect(saved.envVars[0]?.id).not.toMatch(/^envFile_/)
  expect(saved.envVars[0]).toMatchObject({
    fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
    key: 'API_KEY',
    values: {
      development: {
        value: 'secret',
        encrypted: false,
      },
    },
  })
})

test('reads values from env vars without exposing them in argv', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-set-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir
  process.env.SECRET_SOURCE = 'secret-from-env'

  const gitenvs = {
    version: '2',
    envStages: [
      {
        name: 'development',
        publicKey: '',
        encryptedPrivateKey: '',
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

  await writeFile(
    join(testDir, 'gitenvs.json'),
    JSON.stringify(gitenvs, null, 2),
  )
  vi.spyOn(console, 'log').mockImplementation(() => undefined)

  await setCommand({
    file: '.env',
    key: 'API_KEY',
    valueEnv: 'SECRET_SOURCE',
    valueStdin: false,
    stage: 'development',
    encrypt: false,
  })

  const saved = JSON.parse(
    await readFile(join(testDir, 'gitenvs.json'), 'utf-8'),
  ) as Gitenvs

  expect(saved.envVars[0]).toMatchObject({
    key: 'API_KEY',
    values: {
      development: {
        value: 'secret-from-env',
        encrypted: false,
      },
    },
  })
})
