import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { type Passphrase } from '@/gitenvs/gitenvs.schema'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { passphrasesValidateCommand } from './passphrasesCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]
  process.exitCode = undefined
  vi.restoreAllMocks()

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

test('reports legacy configs instead of crashing while validating passphrases', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-passphrases-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

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

  await passphrasesValidateCommand({ json: true })

  const output = consoleLog.mock.calls.map((call) => call.join(' ')).join('\n')
  expect(output).toContain('gitenvs.json is not on the latest version')
  expect(output).not.toContain('very-secret')
  expect(process.exitCode).toBe(1)
})
