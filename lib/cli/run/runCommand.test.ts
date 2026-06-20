import { createKeys } from '@/gitenvs/createKeys'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { type Gitenvs, type Passphrase } from '@/gitenvs/gitenvs.schema'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import {
  spawn as spawnChildProcess,
  type ChildProcess,
  type SpawnOptions,
} from 'child_process'
import { EventEmitter } from 'events'
import { access, mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { buildRunEnvironment, runCommand } from './runCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]
  delete process.env.GITENVS_STAGE
  delete process.env.API_KEY
  delete process.env.PLAIN_FLAG
  vi.restoreAllMocks()

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

const writeTestProject = async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-run-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir

  const keys = await createKeys()
  const gitenvs = {
    version: '2',
    envStages: [
      {
        name: 'development',
        publicKey: keys.publicKey,
        encryptedPrivateKey: keys.encryptedPrivateKey,
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
        id: 'envVar_8r2GLmGTIxyKrQAvkOSREt',
        fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
        key: 'API_KEY',
        values: {
          development: {
            value: await encryptEnvVar({
              plaintext: 'secret-from-gitenvs',
              publicKey: keys.publicKey,
            }),
            encrypted: true,
          },
        },
      },
      {
        id: 'envVar_M22bHTUUs0FAEUWBF8eSqp',
        fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
        key: 'PLAIN_FLAG',
        values: {
          development: {
            value: 'enabled',
            encrypted: false,
          },
        },
      },
    ],
  } satisfies Gitenvs
  const passphrases = [
    {
      stageName: 'development',
      passphrase: keys.passphrase,
    },
  ] satisfies Passphrase[]

  await writeFile(join(testDir, 'gitenvs.json'), JSON.stringify(gitenvs))
  await writeFile(
    join(testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases),
  )

  return testDir
}

const writeMultiFileProject = async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-run-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir

  const keys = await createKeys()
  const gitenvs = {
    version: '2',
    envStages: [
      {
        name: 'development',
        publicKey: keys.publicKey,
        encryptedPrivateKey: keys.encryptedPrivateKey,
      },
    ],
    envFiles: [
      {
        id: 'envFile_web',
        name: 'apps/web/.env',
        filePath: 'apps/web/.env',
        type: 'dotenv',
      },
      {
        id: 'envFile_worker',
        name: 'apps/worker/.env',
        filePath: 'apps/worker/.env',
        type: 'dotenv',
      },
    ],
    envVars: [
      {
        id: 'envVar_shared',
        fileIds: ['envFile_web', 'envFile_worker'],
        key: 'SHARED_SECRET',
        values: {
          development: {
            value: 'shared',
            encrypted: false,
          },
        },
      },
      {
        id: 'envVar_web',
        fileIds: ['envFile_web'],
        key: 'APP_SECRET',
        values: {
          development: {
            value: 'web-secret',
            encrypted: false,
          },
        },
      },
      {
        id: 'envVar_worker',
        fileIds: ['envFile_worker'],
        key: 'APP_SECRET',
        values: {
          development: {
            value: 'worker-secret',
            encrypted: false,
          },
        },
      },
      {
        id: 'envVar_worker_only',
        fileIds: ['envFile_worker'],
        key: 'WORKER_ONLY',
        values: {
          development: {
            value: 'yes',
            encrypted: false,
          },
        },
      },
    ],
  } satisfies Gitenvs
  const passphrases = [
    {
      stageName: 'development',
      passphrase: keys.passphrase,
    },
  ] satisfies Passphrase[]

  await writeFile(join(testDir, 'gitenvs.json'), JSON.stringify(gitenvs))
  await writeFile(
    join(testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases),
  )

  return testDir
}

test('builds a child environment without creating env files', async () => {
  const dir = await writeTestProject()
  process.env.API_KEY = 'parent-value'

  const env = await buildRunEnvironment({
    stage: 'development',
    command: 'node',
    args: [],
  })

  expect(env.API_KEY).toBe('secret-from-gitenvs')
  expect(env.PLAIN_FLAG).toBe('enabled')
  await expect(access(join(dir, '.env'))).rejects.toThrow()
})

test('builds a child environment from the selected env file', async () => {
  await writeMultiFileProject()

  const env = await buildRunEnvironment({
    file: 'apps/web/.env',
    stage: 'development',
    command: 'node',
    args: [],
  })

  expect(env.SHARED_SECRET).toBe('shared')
  expect(env.APP_SECRET).toBe('web-secret')
  expect(env.WORKER_ONLY).toBeUndefined()
})

test('spawns the command with inherited stdio and returns the child exit code', async () => {
  await writeTestProject()
  const child = new EventEmitter() as ChildProcess
  child.kill = vi.fn()
  child.killed = false

  const spawnProcess = vi.fn(
    (_command: string, _args: readonly string[], _options: SpawnOptions) =>
      child,
  )

  const resultPromise = runCommand(
    {
      stage: 'development',
      command: 'node',
      args: ['script.js', '--flag', 'value'],
    },
    spawnProcess,
  )

  await vi.waitFor(() => expect(spawnProcess).toHaveBeenCalled())
  child.emit('exit', 7, null)

  await expect(resultPromise).resolves.toEqual({ code: 7 })
  expect(spawnProcess).toHaveBeenCalledWith(
    'node',
    ['script.js', '--flag', 'value'],
    expect.objectContaining({
      stdio: 'inherit',
      env: expect.objectContaining({
        API_KEY: 'secret-from-gitenvs',
        PLAIN_FLAG: 'enabled',
      }),
    }),
  )
})

test('CLI run passes args through quietly and returns the child exit code', async () => {
  const dir = await writeTestProject()
  const result = await runCli([
    'run',
    '--stage',
    'development',
    '--',
    'node',
    '-e',
    'process.exit(process.env.API_KEY === "secret-from-gitenvs" && process.argv[1] === "--child-flag" ? 23 : 42)',
    '--',
    '--child-flag',
  ])

  expect(result).toEqual({
    code: 23,
    stdout: '',
    stderr: '',
  })
  await expect(access(join(dir, '.env'))).rejects.toThrow()
})

test('CLI run requires --file when multiple env files are configured', async () => {
  await writeMultiFileProject()

  const result = await runCli([
    'run',
    '--stage',
    'development',
    '--',
    'node',
    '-e',
    'process.exit(0)',
  ])

  expect(result.code).toBe(1)
  expect(result.stdout).toBe('')
  expect(result.stderr).toContain(
    'Multiple env files are configured. Pass --file <filePath>.',
  )
  expect(result.stderr).toContain('apps/web/.env, apps/worker/.env')
})

const runCli = async (args: string[]) => {
  return new Promise<{
    code: number
    stdout: string
    stderr: string
  }>((resolve, reject) => {
    const child = spawnChildProcess(
      'pnpm',
      ['exec', 'tsx', 'lib/cli/main.ts', ...args],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.once('error', reject)
    child.once('close', (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
      })
    })
  })
}
