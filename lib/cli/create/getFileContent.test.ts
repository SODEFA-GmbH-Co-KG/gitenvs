import { createKeys } from '@/gitenvs/createKeys'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { Gitenvs } from '@/gitenvs/gitenvs.schema'
import { expect, test } from 'vitest'
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
    `export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://localhost:5432/mydatabase'
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '238423498842850'
export const ENABLE_SUPER_FEATURE = process.env.ENABLE_SUPER_FEATURE ?? 'true'
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'secretDevelopment'`,
  )

  expect(
    await getFileContent({
      gitenvs,
      envFile: tsEnvFile,
      envStage: stagingStage,
      passphrase: stagingPassphrase,
    }),
  ).toBe(
    `export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://staging:5432/mydatabase'
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '238423498842850'
export const ENABLE_SUPER_FEATURE = process.env.ENABLE_SUPER_FEATURE ?? 'false'
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'secretStaging'`,
  )

  expect(
    await getFileContent({
      gitenvs,
      envFile: tsEnvFile,
      envStage: productionStage,
      passphrase: productionPassphrase,
    }),
  ).toBe(
    `export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://production:5432/mydatabase'
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '238423498842850'
export const ENABLE_SUPER_FEATURE = process.env.ENABLE_SUPER_FEATURE ?? 'false'
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'secretProduction'`,
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
  ).toBe(`HASHTAG="hello#world"`)

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
  ).rejects.toThrow(/includes both single and double/i)
})
