import { createCipheriv, publicEncrypt, randomBytes } from 'crypto'
import { DEFAULT_CRYPTO_OPTIONS } from './options'
import { Keys } from './types/Keys'
import { SecretData } from './types/SecretData'

export const encryptSecret = ({
  toEncrypt,
  stage,
  keys,
}: {
  toEncrypt: string
  stage: string
  keys: Keys<string>
}) => {
  const stageKeys = keys[stage]

  if (!stageKeys) {
    throw new Error(`No public key provided for stage ${stage}`)
  }

  const symmetricKey = randomBytes(32)
  const iv = randomBytes(16)

  const symmetricEncrypted = encryptSymmetric({
    toEncrypt,
    key: symmetricKey,
    iv,
  })

  const encryptedSymmetricKey = publicEncrypt(
    {
      key: Buffer.from(stageKeys.publicKey, 'base64'),
      ...DEFAULT_CRYPTO_OPTIONS,
    },
    symmetricKey
  ).toString('base64')

  const secretData: SecretData = {
    ...symmetricEncrypted,
    encryptedSymmetricKey,
  }

  const stringified = JSON.stringify(secretData)

  return Buffer.from(stringified, 'utf8').toString('base64')
}

const encryptSymmetric = ({
  toEncrypt,
  key,
  iv,
}: {
  toEncrypt: string
  key: Buffer
  iv: Buffer
}) => {
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  const encrypted = Buffer.concat([cipher.update(toEncrypt), cipher.final()])
  return {
    iv: iv.toString('base64'),
    encryptedValue: encrypted.toString('base64'),
  }
}
