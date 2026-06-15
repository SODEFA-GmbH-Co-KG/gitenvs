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
