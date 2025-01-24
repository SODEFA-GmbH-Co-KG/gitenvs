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
    ],
    envVars: [
      {
        id: 'envVar_8r2GLmGTIxyKrQAvkOSREt',
        fileIds: ['envFile_6Gv71d0ZenuC9N39CeGz1c'],
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

const developmentStage = testdata.gitenvs.envStages[0]!
const developmentPassphrase = testdata.developmentKeys.passphrase

const stagingStage = testdata.gitenvs.envStages[1]!
const stagingPassphrase = testdata.stagingKeys.passphrase

const productionStage = testdata.gitenvs.envStages[2]!
const productionPassphrase = testdata.productionKeys.passphrase

test('getFileContent', async () => {
  expect(
    await getFileContent({
      gitenvs,
      envFile: dotEnvFile,
      envStage: developmentStage,
      passphrase: developmentPassphrase,
    }),
  ).toBe('DATABASE_URL=postgres://localhost:5432/mydatabase')

  expect(
    await getFileContent({
      gitenvs,
      envFile: dotEnvFile,
      envStage: stagingStage,
      passphrase: stagingPassphrase,
    }),
  ).toBe('DATABASE_URL=postgres://staging:5432/mydatabase')

  expect(
    await getFileContent({
      gitenvs,
      envFile: dotEnvFile,
      envStage: productionStage,
      passphrase: productionPassphrase,
    }),
  ).toBe('DATABASE_URL=postgres://production:5432/mydatabase')
})
