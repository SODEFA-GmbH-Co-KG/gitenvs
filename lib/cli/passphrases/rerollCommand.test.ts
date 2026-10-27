import { createKeys } from '@/gitenvs/createKeys'
import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { GITENVS_DIR_ENV_NAME } from '@/gitenvs/env'
import { BACKUP_DIR_NAME, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { type Gitenvs, type Passphrase } from '@/gitenvs/gitenvs.schema'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { rerollPassphrases } from '@/gitenvs/rerollPassphrases'
import { passphrasesRerollCommand } from './rerollCommand'

let testDir: string | undefined

afterEach(async () => {
  delete process.env[GITENVS_DIR_ENV_NAME]
  delete process.env.GITENVS_PASSPHRASE_PRODUCTION
  process.exitCode = undefined
  vi.restoreAllMocks()

  if (testDir) {
    await rm(testDir, { recursive: true, force: true })
    testDir = undefined
  }
})

const setupProject = async () => {
  testDir = await mkdtemp(join(tmpdir(), 'gitenvs-reroll-'))
  process.env[GITENVS_DIR_ENV_NAME] = testDir
  await writeFile(join(testDir, 'package.json'), '{"name":"test"}')

  const stages = await Promise.all(
    ['development', 'production'].map(async (name) => ({
      name,
      ...(await createKeys()),
    })),
  )

  const encrypt = (stageName: string, plaintext: string) =>
    encryptEnvVar({
      plaintext,
      publicKey: stages.find((s) => s.name === stageName)!.publicKey,
    })

  const gitenvs = {
    version: '2',
    envStages: stages.map(({ passphrase: _passphrase, ...stage }) => stage),
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
        fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
        key: 'API_KEY',
        values: {
          development: {
            value: await encrypt('development', 'dev-secret'),
            encrypted: true,
          },
          production: {
            value: await encrypt('production', 'prod-secret'),
            encrypted: true,
          },
        },
      },
      {
        id: 'envVar_7Gv71d0ZenuC9N39CeGz1c',
        fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
        key: 'PUBLIC_URL',
        values: {
          development: { value: 'http://localhost', encrypted: false },
          production: { value: 'https://example.com', encrypted: false },
        },
      },
    ],
  } satisfies Gitenvs

  const passphrases = stages.map((s) => ({
    stageName: s.name,
    passphrase: s.passphrase,
  })) satisfies Passphrase[]

  await writeFile(
    join(testDir, 'gitenvs.json'),
    JSON.stringify(gitenvs, null, 2),
  )
  await writeFile(
    join(testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases, null, 2),
  )

  return { gitenvs, passphrases, testDir }
}

const readProject = async (dir: string) => ({
  gitenvs: JSON.parse(
    await readFile(join(dir, 'gitenvs.json'), 'utf-8'),
  ) as Gitenvs,
  passphrases: JSON.parse(
    await readFile(join(dir, PASSPHRASE_FILE_NAME), 'utf-8'),
  ) as Passphrase[],
})

const decryptValue = async ({
  gitenvs,
  passphrases,
  key,
  stageName,
}: {
  gitenvs: Gitenvs
  passphrases: Passphrase[]
  key: string
  stageName: string
}) =>
  decryptEnvVar({
    encrypted: gitenvs.envVars.find((v) => v.key === key)!.values[stageName]!
      .value,
    encryptedPrivateKey: gitenvs.envStages.find((s) => s.name === stageName)!
      .encryptedPrivateKey,
    passphrase: passphrases.find((p) => p.stageName === stageName)!.passphrase,
  })

test('rerolls all stages and keeps every value decryptable', async () => {
  const old = await setupProject()
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  await passphrasesRerollCommand({ yes: true, dryRun: false, json: true })

  expect(process.exitCode).toBeUndefined()
  const output = consoleLog.mock.calls.map((call) => call.join(' ')).join('\n')
  const result = JSON.parse(output) as {
    ok: boolean
    stages: string[]
    reencryptedValues: number
    backupDir: string
    passphraseEnvNames: string[]
  }
  expect(result).toMatchObject({
    ok: true,
    stages: ['development', 'production'],
    reencryptedValues: 2,
    passphraseEnvNames: [
      'GITENVS_PASSPHRASE_DEVELOPMENT',
      'GITENVS_PASSPHRASE_PRODUCTION',
    ],
  })

  const current = await readProject(old.testDir)
  for (const { stageName } of old.passphrases) {
    expect(
      current.passphrases.find((p) => p.stageName === stageName)?.passphrase,
    ).not.toBe(
      old.passphrases.find((p) => p.stageName === stageName)?.passphrase,
    )
  }
  for (const passphrase of [...old.passphrases, ...current.passphrases]) {
    expect(output).not.toContain(passphrase.passphrase)
  }

  expect(
    await decryptValue({
      ...current,
      key: 'API_KEY',
      stageName: 'development',
    }),
  ).toBe('dev-secret')
  expect(
    await decryptValue({ ...current, key: 'API_KEY', stageName: 'production' }),
  ).toBe('prod-secret')
  expect(
    current.gitenvs.envVars.find((v) => v.key === 'PUBLIC_URL')?.values,
  ).toEqual(old.gitenvs.envVars.find((v) => v.key === 'PUBLIC_URL')?.values)

  const backupPassphrases = JSON.parse(
    await readFile(join(result.backupDir, PASSPHRASE_FILE_NAME), 'utf-8'),
  ) as Passphrase[]
  expect(backupPassphrases).toEqual(old.passphrases)
  const backupGitenvs = JSON.parse(
    await readFile(join(result.backupDir, 'gitenvs.json'), 'utf-8'),
  ) as Gitenvs
  expect(backupGitenvs.envStages).toEqual(old.gitenvs.envStages)

  const gitignore = await readFile(join(old.testDir, '.gitignore'), 'utf-8')
  expect(gitignore).toContain(`${BACKUP_DIR_NAME}/`)
})

test('rerolls only the selected stages', async () => {
  const old = await setupProject()
  vi.spyOn(console, 'log').mockImplementation(() => undefined)

  await passphrasesRerollCommand({
    stages: 'production',
    yes: true,
    dryRun: false,
    json: true,
  })

  expect(process.exitCode).toBeUndefined()
  const current = await readProject(old.testDir)

  expect(current.passphrases).toHaveLength(2)
  expect(current.passphrases[0]).toEqual(old.passphrases[0])
  expect(current.passphrases[1]?.passphrase).not.toBe(
    old.passphrases[1]?.passphrase,
  )
  expect(current.gitenvs.envStages[0]).toEqual(old.gitenvs.envStages[0])
  expect(current.gitenvs.envVars[0]?.values.development).toEqual(
    old.gitenvs.envVars[0]?.values.development,
  )
  expect(
    await decryptValue({ ...current, key: 'API_KEY', stageName: 'production' }),
  ).toBe('prod-secret')
})

test('does not change anything if a value cannot be decrypted', async () => {
  const old = await setupProject()
  const wrongPassphrase = (await createKeys()).passphrase
  await writeFile(
    join(old.testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(
      [
        old.passphrases[0],
        { ...old.passphrases[1], passphrase: wrongPassphrase },
      ],
      null,
      2,
    ),
  )
  const before = await readProject(old.testDir)
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await passphrasesRerollCommand({ yes: true, dryRun: false, json: true })

  expect(process.exitCode).toBe(1)
  const result = JSON.parse(consoleLog.mock.calls[0]?.[0] as string) as {
    ok: boolean
    error: string
  }
  expect(result.ok).toBe(false)
  expect(result.error).toContain('API_KEY')
  expect(await readProject(old.testDir)).toEqual(before)
  expect(await readdir(old.testDir)).not.toContain(BACKUP_DIR_NAME)
})

test('requires --yes', async () => {
  const old = await setupProject()
  const before = await readProject(old.testDir)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await passphrasesRerollCommand({ yes: false, dryRun: false, json: false })

  expect(process.exitCode).toBe(1)
  expect(await readProject(old.testDir)).toEqual(before)
})

test('dry run checks everything without writing', async () => {
  const old = await setupProject()
  const before = await readProject(old.testDir)
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  await passphrasesRerollCommand({ yes: false, dryRun: true, json: true })

  expect(process.exitCode).toBeUndefined()
  const output = consoleLog.mock.calls.map((call) => call.join(' ')).join('\n')
  expect(JSON.parse(output)).toMatchObject({
    ok: true,
    dryRun: true,
    stages: ['development', 'production'],
    reencryptedValues: 2,
    backupDir: null,
  })
  for (const passphrase of old.passphrases) {
    expect(output).not.toContain(passphrase.passphrase)
  }
  expect(await readProject(old.testDir)).toEqual(before)
  const files = await readdir(old.testDir)
  expect(files).not.toContain(BACKUP_DIR_NAME)
  expect(files).not.toContain('.gitignore')
})

test('dry run fails if a passphrase is missing', async () => {
  const old = await setupProject()
  await writeFile(
    join(old.testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify([old.passphrases[0]], null, 2),
  )
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  await passphrasesRerollCommand({ yes: false, dryRun: true, json: true })

  expect(process.exitCode).toBe(1)
  const result = JSON.parse(consoleLog.mock.calls[0]?.[0] as string) as {
    ok: boolean
    error: string
  }
  expect(result.ok).toBe(false)
  expect(result.error).toContain('No passphrase found for stage production')
})

const getJsonOutput = (consoleLog: { mock: { calls: unknown[][] } }) =>
  JSON.parse(
    consoleLog.mock.calls.map((call) => call.join(' ')).join('\n'),
  ) as {
    ok: boolean
    error?: string
    stages?: string[]
    warnings?: string[]
  }

test('asks which passphrase to use if file and env var differ', async () => {
  const old = await setupProject()
  process.env.GITENVS_PASSPHRASE_PRODUCTION = (await createKeys()).passphrase
  const before = await readProject(old.testDir)
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  await passphrasesRerollCommand({ yes: true, dryRun: false, json: true })

  expect(process.exitCode).toBe(1)
  const result = getJsonOutput(consoleLog)
  expect(result.error).toContain('differs between')
  expect(result.error).toContain('--passphrase-source')
  expect(await readProject(old.testDir)).toEqual(before)
})

test('uses the chosen passphrase source', async () => {
  const old = await setupProject()
  // env holds the correct passphrase, the file a wrong one
  process.env.GITENVS_PASSPHRASE_PRODUCTION = old.passphrases[1]!.passphrase
  await writeFile(
    join(old.testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(
      [
        old.passphrases[0],
        {
          stageName: 'production',
          passphrase: (await createKeys()).passphrase,
        },
      ],
      null,
      2,
    ),
  )
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await passphrasesRerollCommand({
    stages: 'production',
    yes: true,
    dryRun: true,
    passphraseSource: 'file',
    json: true,
  })
  expect(process.exitCode).toBe(1)
  expect(getJsonOutput(consoleLog).error).toContain('Could not decrypt')

  process.exitCode = undefined
  consoleLog.mockClear()

  await passphrasesRerollCommand({
    stages: 'production',
    yes: true,
    dryRun: false,
    passphraseSource: 'env',
    json: true,
  })
  expect(process.exitCode).toBeUndefined()
  const result = getJsonOutput(consoleLog)
  expect(result.ok).toBe(true)
  expect(result.warnings?.join('\n')).toContain(
    'GITENVS_PASSPHRASE_PRODUCTION is set in the current environment',
  )

  const current = await readProject(old.testDir)
  expect(
    await decryptValue({ ...current, key: 'API_KEY', stageName: 'production' }),
  ).toBe('prod-secret')
})

test('accepts duplicate stage names', async () => {
  const old = await setupProject()
  const consoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  await passphrasesRerollCommand({
    stages: 'production,production',
    yes: true,
    dryRun: false,
    json: true,
  })

  expect(process.exitCode).toBeUndefined()
  expect(getJsonOutput(consoleLog).stages).toEqual(['production'])
  const current = await readProject(old.testDir)
  expect(current.passphrases).toHaveLength(2)
  expect(
    await decryptValue({ ...current, key: 'API_KEY', stageName: 'production' }),
  ).toBe('prod-secret')
  expect(await readdir(old.testDir)).not.toContain(
    `${PASSPHRASE_FILE_NAME}.tmp`,
  )
})

test('uses passphrases passed in directly (e.g. entered in the browser)', async () => {
  const old = await setupProject()
  await writeFile(
    join(old.testDir, PASSPHRASE_FILE_NAME),
    JSON.stringify([old.passphrases[0]], null, 2),
  )

  const result = await rerollPassphrases({
    passphrases: [old.passphrases[1]!],
  })

  expect(result.stages).toEqual(['development', 'production'])
  const current = await readProject(old.testDir)
  expect(current.passphrases.map((p) => p.stageName)).toEqual([
    'development',
    'production',
  ])
  expect(
    await decryptValue({ ...current, key: 'API_KEY', stageName: 'production' }),
  ).toBe('prod-secret')
})
