import { createDecipheriv, privateDecrypt } from 'crypto'
import { flatMap, map } from 'lodash'
import { DEFAULT_CRYPTO_OPTIONS } from '../lib/options'
import { GenerateEnvFilesFunction } from './types/GenerateEnvVarsFunction'
import { SecretData } from './types/SecretData'

export const decryptEnvVars = ({
  privateKey,
  passphrase,
  stage,
  generateEnvVars,
}: {
  stage: string
  privateKey?: string | undefined
  passphrase: string
  generateEnvVars: GenerateEnvFilesFunction<string>
}) => {
  const resolveSecret = createResolveSecretFunction({ privateKey, passphrase })
  const decryptedEnvVars = generateEnvVars({ resolveSecret, stage })
  const explodedEnvVars = flatMap(decryptedEnvVars, (config) =>
    map(config.envFiles, (envFile) => ({
      envFile,
      key: config.key,
      values: config.values,
    })),
  )
  const envVars = map(explodedEnvVars, ({ values, ...config }) => ({
    ...config,
    value: (stage in values ? values[stage] : values['default']) ?? undefined,
  }))

  return envVars
}

const createResolveSecretFunction = ({
  privateKey,
  passphrase,
}: {
  privateKey: string | undefined
  passphrase: string
}) => {
  const resolveSecret = (input: string) => {
    if (!privateKey) {
      console.log('No private key provided')
      return undefined
    }

    if (!input) return

    const stringified = Buffer.from(input, 'base64').toString()
    const data: SecretData = JSON.parse(stringified)

    const { iv, encryptedValue, encryptedSymmetricKey } = data

    if (!iv || !encryptedValue || !encryptedSymmetricKey) {
      console.log('Invalid secret data')
      return
    }

    try {
      // FROM: https://whyboobo.com/devops/tutorials/asymmetric-encryption-with-nodejs/
      const decryptedKey = privateDecrypt(
        {
          key: Buffer.from(privateKey, 'base64'),
          passphrase,
          ...DEFAULT_CRYPTO_OPTIONS,
        },
        Buffer.from(encryptedSymmetricKey, 'base64'),
      )

      return decryptSymmetric({
        iv: Buffer.from(iv, 'base64'),
        key: decryptedKey,
        toDecrypt: encryptedValue,
      })
    } catch (error) {
      if (
        ![
          'ERR_OSSL_RSA_OAEP_DECODING_ERROR',
          'ERR_MISSING_PASSPHRASE',
          'ERR_OSSL_EVP_BAD_DECRYPT',
          'ERR_OSSL_RSA_DATA_TOO_LARGE_FOR_MODULUS',
        ].includes((error as any)?.code) // TODO: Remove as any
      ) {
        throw error
      }

      return undefined
    }
  }
  return resolveSecret
}

const decryptSymmetric = ({
  toDecrypt,
  key,
  iv,
}: {
  toDecrypt: string
  key: Buffer
  iv: Buffer
}) => {
  const encryptedText = Buffer.from(toDecrypt, 'base64')
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ])
  return decrypted.toString()
}
