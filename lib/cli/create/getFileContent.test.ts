import { createKeys } from '@/gitenvs/createKeys'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { type EnvFile, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { expect, test, vi } from 'vitest'
import { getFileContent } from './getFileContent'

const getTestdata = async () => {
  const [developmentKeys, stagingKeys, productionKeys] = await Promise.all([
    createKeys(),
    createKeys(),
    createKeys(),
  ])

  const gitenvs = {
    version: '2',
    envStages: [
      {
        name: 'development',
        encryptedPrivateKey: developmentKeys.encryptedPrivateKey,
        publicKey: developmentKeys.publicKey,
      },
      {
        name: 'staging',
        encryptedPrivateKey: stagingKeys.encryptedPrivateKey,
        publicKey: stagingKeys.publicKey,
      },
      {
        name: 'production',
        encryptedPrivateKey: productionKeys.encryptedPrivateKey,
        publicKey: productionKeys.publicKey,
      },
    ],
    envFiles: [
      {
        id: 'envFile_6Gv71d0ZenuC9N39CeGz1c',
        name: '.env',
        filePath: '.env',
        type: 'dotenv',
      },
      {
        id: 'envFile_V64kqIkyLTW1CqntKhSGzi',
        name: '.env.ts',
        filePath: '.env.ts',
        type: '.ts',
      },
    ],
    envVars: [
      {
        id: 'envVar_8r2GLmGTIxyKrQAvkOSREt',
        fileIds: [
          'envFile_6Gv71d0ZenuC9N39CeGz1c',
          'envFile_V64kqIkyLTW1CqntKhSGzi',
        ],
        key: 'DATABASE_URL',
        values: {
          development: {
            value: 'postgres://localhost:5432/mydatabase',
            encrypted: false,
          },
          staging: {
            value: await encryptEnvVar({
              plaintext: 'postgres://staging:5432/mydatabase',
              publicKey: stagingKeys.publicKey,
            }),
            encrypted: true,
          },
          production: {
            value: await encryptEnvVar({
              plaintext: 'postgres://production:5432/mydatabase',
              publicKey: productionKeys.publicKey,
            }),
            encrypted: true,
          },
        },
      },
      {
        id: 'envVar_M22bHTUUs0FAEUWBF8eSqp',
        fileIds: [
          'envFile_6Gv71d0ZenuC9N39CeGz1c',
          'envFile_V64kqIkyLTW1CqntKhSGzi',
        ],
        key: 'DISCORD_CLIENT_ID',
        values: {
          development: {
            value: '238423498842850',
            encrypted: false,
          },
          staging: {
            value: '238423498842850',
            encrypted: false,
          },
          production: {
            value: '238423498842850',
            encrypted: false,
          },
        },
      },
      {
        id: 'envVar_RkV9VV9Y53GybSnslqrR3q',
        fileIds: [
          'envFile_6Gv71d0ZenuC9N39CeGz1c',
          'envFile_V64kqIkyLTW1CqntKhSGzi',
        ],
        key: 'ENABLE_SUPER_FEATURE',
        values: {
          development: {
            value: 'true',
            encrypted: false,
          },
          staging: {
            value: 'false',
            encrypted: false,
          },
          production: {
            value: 'false',
            encrypted: false,
          },
        },
      },
      {
        id: 'envVar_4wUc7KZvqV9sjk3JMiHBPI',
        fileIds: ['envFile_V64kqIkyLTW1CqntKhSGzi'],
        key: 'NEXTAUTH_SECRET',
        values: {
          development: {
            value: await encryptEnvVar({
              plaintext: 'secretDevelopment',
              publicKey: developmentKeys.publicKey,
            }),
            encrypted: true,
          },
          staging: {
            value: await encryptEnvVar({
              plaintext: 'secretStaging',
              publicKey: stagingKeys.publicKey,
            }),
            encrypted: true,
          },
          production: {
            value: await encryptEnvVar({
              plaintext: 'secretProduction',
              publicKey: productionKeys.publicKey,
            }),
            encrypted: true,
          },
        },
      },
    ],
  } satisfies Gitenvs

  return {
    gitenvs,
    developmentKeys,
    stagingKeys,
    productionKeys,
  }
}

const testdata = await getTestdata()
const gitenvs = testdata.gitenvs

const dotEnvFile = testdata.gitenvs.envFiles[0]!
const tsEnvFile = testdata.gitenvs.envFiles[1]!
const developmentStage = testdata.gitenvs.envStages[0]!
const developmentPassphrase = testdata.developmentKeys.passphrase

const stagingStage = testdata.gitenvs.envStages[1]!
const stagingPassphrase = testdata.stagingKeys.passphrase

const productionStage = testdata.gitenvs.envStages[2]!
const productionPassphrase = testdata.productionKeys.passphrase

test('dotenv file content', async () => {
  expect(
    await getFileContent({
      gitenvs,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe(`DATABASE_URL=postgres://localhost:5432/mydatabase
DISCORD_CLIENT_ID=238423498842850
ENABLE_SUPER_FEATURE=true`)

  expect(
    await getFileContent({
      gitenvs,
      envFile: dotEnvFile,
      envStage: stagingStage,
      passphrase: stagingPassphrase,
    }),
  ).toBe(`DATABASE_URL=postgres://staging:5432/mydatabase
DISCORD_CLIENT_ID=238423498842850
ENABLE_SUPER_FEATURE=false`)

  expect(
    await getFileContent({
      gitenvs,
      envFile: dotEnvFile,
      envStage: productionStage,
      passphrase: productionPassphrase,
    }),
  ).toBe(`DATABASE_URL=postgres://production:5432/mydatabase
DISCORD_CLIENT_ID=238423498842850
ENABLE_SUPER_FEATURE=false`)
})

test('.ts file content', async () => {
  expect(
    await getFileContent({
      gitenvs,
      envFile: tsEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe(
    `export const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://localhost:5432/mydatabase"
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "238423498842850"
export const ENABLE_SUPER_FEATURE = process.env.ENABLE_SUPER_FEATURE ?? "true"
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "secretDevelopment"`,
  )

  expect(
    await getFileContent({
      gitenvs,
      envFile: tsEnvFile,
      envStage: stagingStage,
      passphrase: stagingPassphrase,
    }),
  ).toBe(
    `export const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://staging:5432/mydatabase"
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "238423498842850"
export const ENABLE_SUPER_FEATURE = process.env.ENABLE_SUPER_FEATURE ?? "false"
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "secretStaging"`,
  )

  expect(
    await getFileContent({
      gitenvs,
      envFile: tsEnvFile,
      envStage: productionStage,
      passphrase: productionPassphrase,
    }),
  ).toBe(
    `export const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://production:5432/mydatabase"
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "238423498842850"
export const ENABLE_SUPER_FEATURE = process.env.ENABLE_SUPER_FEATURE ?? "false"
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "secretProduction"`,
  )
})

test('dotenv: hashtag quoting', async () => {
  let gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'HASHTAG',
      values: {
        development: { value: 'hello#world', encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  expect(
    await getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe(`HASHTAG='hello#world'`)

  gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'HASHTAG',
      values: {
        development: { value: "'hello#world'", encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  expect(
    await getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe(`HASHTAG="'hello#world'"`)

  gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'HASHTAG',
      values: {
        development: { value: '"hello#world"', encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  expect(
    await getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe(`HASHTAG='"hello#world"'`)

  gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'HASHTAG',
      values: {
        development: { value: `'"hello#world"'`, encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  await expect(
    getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).rejects.toThrow(/both dotenv-parser compatible and shell-sourceable/i)
})

test('dotenv: shell-sensitive characters are quoted safely', async () => {
  let gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'SHELL_SENSITIVE',
      values: {
        development: { value: 'hello world & $PATH `date`', encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  expect(
    await getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe("SHELL_SENSITIVE='hello world & $PATH `date`'")

  gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'SINGLE_QUOTE',
      values: {
        development: { value: "hello 'quoted' world", encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  expect(
    await getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe(`SINGLE_QUOTE="hello 'quoted' world"`)

  gitenvsToTest = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
      key: 'UNREPRESENTABLE',
      values: {
        development: { value: "can't keep $PATH literal", encrypted: false },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  await expect(
    getFileContent({
      gitenvs: gitenvsToTest,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).rejects.toThrow(/both dotenv-parser compatible and shell-sourceable/i)
})

const getDevelopmentFileContent = async ({
  envFile,
  key,
  value,
  encrypted = false,
  isFunction = false,
}: {
  envFile: EnvFile
  key: string
  value: string
  encrypted?: boolean
  isFunction?: boolean
}) => {
  const gitenvsToTest: Gitenvs = structuredClone(gitenvs)
  gitenvsToTest.envVars = [
    {
      id: 'envVar_kaVu9WJituDFeGEf1u4Aob',
      fileIds: [envFile.id],
      key,
      values: {
        development: { value, encrypted, isFunction },
        staging: { value: '', encrypted: false },
        production: { value: '', encrypted: false },
      },
    },
  ]
  return getFileContent({
    gitenvs: gitenvsToTest,
    envFile,
    envStage: developmentStage,
    passphrase: developmentPassphrase,
  })
}

// Evaluates the generated .ts code and returns the exported value
const evaluateTsLine = ({ code, key }: { code: string; key: string }) =>
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('process', `${code.replace(/^export /, '')}; return ${key}`)({
    env: {},
  }) as unknown

test('.ts: quoting', async () => {
  const values = [
    '"hello world"',
    "'hello world'",
    "'hello world`o'",
    '"hell\'o world`o"',
    "can't ${process.exit(1)} `${1 + 1}`",
    'back\\slash \\n \\u0041 \\${x}',
    'line\nbreak\r\n\ttab',
    'unicode \u2028 \u2029 ä 🔒',
    '',
  ]

  for (const value of values) {
    const code = await getDevelopmentFileContent({
      envFile: tsEnvFile,
      key: 'QUOTES',
      value,
    })
    if (!value) {
      expect(code).toBe('')
      continue
    }
    expect(code).toBe(
      `export const QUOTES = process.env.QUOTES ?? ${JSON.stringify(value)}`,
    )
    expect(evaluateTsLine({ code, key: 'QUOTES' })).toBe(value)
  }
})

test('.ts: invalid keys', async () => {
  for (const key of ['MY-KEY', '1KEY', 'MY KEY', 'a=1;b', 'default', '']) {
    await expect(
      getDevelopmentFileContent({ envFile: tsEnvFile, key, value: 'value' }),
    ).rejects.toThrow(/is not a valid JavaScript identifier/i)
  }

  expect(
    await getDevelopmentFileContent({
      envFile: tsEnvFile,
      key: '_$valid_KEY1',
      value: 'value',
    }),
  ).toBe('export const _$valid_KEY1 = process.env._$valid_KEY1 ?? "value"')
})

test('function: evaluates expressions and IIFEs', async () => {
  const cases = [
    {
      value: 'new Date(0).toISOString()',
      expected: '1970-01-01T00:00:00.000Z',
    },
    { value: '[1, 2].map((n) => n * 2).join("-")', expected: '2-4' },
    { value: '(() => { const a = 40; return a + 2 })()', expected: '42' },
    { value: '[1, 2]', expected: '1,2' },
    { value: 'undefined', expected: 'undefined' },
    // Runs in the global scope without access to local variables
    { value: 'typeof passphrase', expected: 'undefined' },
  ]

  for (const { value, expected } of cases) {
    expect(
      await getDevelopmentFileContent({
        envFile: dotEnvFile,
        key: 'FUNCTION',
        value,
        isFunction: true,
      }),
    ).toBe(`FUNCTION=${expected}`)
  }

  expect(
    await getDevelopmentFileContent({
      envFile: dotEnvFile,
      key: 'FUNCTION',
      value: 'Date.now()',
      isFunction: true,
    }),
  ).toMatch(/^FUNCTION=\d+$/)
})

test('function: can read process.env', async () => {
  vi.stubEnv('VERCEL_URL', 'my-app.vercel.app')

  expect(
    await getDevelopmentFileContent({
      envFile: tsEnvFile,
      key: 'BASE_URL',
      value: '`https://${process.env.VERCEL_URL}`',
      isFunction: true,
    }),
  ).toBe(
    'export const BASE_URL = process.env.BASE_URL ?? "https://my-app.vercel.app"',
  )

  vi.unstubAllEnvs()
})

test('function: errors fail', async () => {
  for (const value of ['this is not javascript', 'throw new Error("nope")']) {
    await expect(
      getDevelopmentFileContent({
        envFile: dotEnvFile,
        key: 'FUNCTION',
        value,
        isFunction: true,
      }),
    ).rejects.toThrow(/Error evaluating function "FUNCTION"/)
  }
})

test('function: encrypted functions fail', async () => {
  await expect(
    getDevelopmentFileContent({
      envFile: dotEnvFile,
      key: 'FUNCTION',
      value: await encryptEnvVar({
        plaintext: '"value"',
        publicKey: testdata.developmentKeys.publicKey,
      }),
      encrypted: true,
      isFunction: true,
    }),
  ).rejects.toThrow(/"FUNCTION" is an encrypted function for stage development/)
})

test('decryption errors fail', async () => {
  await expect(
    getDevelopmentFileContent({
      envFile: dotEnvFile,
      key: 'SECRET',
      // Encrypted for another stage
      value: await encryptEnvVar({
        plaintext: 'secret',
        publicKey: testdata.stagingKeys.publicKey,
      }),
      encrypted: true,
    }),
  ).rejects.toThrow(/Could not decrypt "SECRET" for stage development/)

  await expect(
    getFileContent({
      gitenvs,
      envFile: tsEnvFile,
      envStage: developmentStage,
      passphrase: stagingPassphrase,
    }),
  ).rejects.toThrow(/Could not decrypt "NEXTAUTH_SECRET" for stage development/)
})
