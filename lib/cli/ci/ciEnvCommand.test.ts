import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { ciEnvCommand } from './ciEnvCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]
  vi.restoreAllMocks()

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

test('prints CI metadata without secret values', async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-ci-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

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

  await writeFile(join(testDir, 'gitenvs.json'), JSON.stringify(gitenvs))

  await ciEnvCommand({
    stage: 'production',
    json: true,
  })

  const output = consoleLog.mock.calls.map((call) => call.join(' ')).join('\n')
  expect(output).toContain('GITENVS_PASSPHRASE_PRODUCTION')
  expect(output).toContain('gitenvs.passphrases.json')
  expect(output).not.toContain('encrypted-private-key')
})
