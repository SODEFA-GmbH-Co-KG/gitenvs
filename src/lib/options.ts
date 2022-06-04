import { RSA_PKCS1_OAEP_PADDING } from 'constants'

export const DEFAULT_CRYPTO_OPTIONS = {
  padding: RSA_PKCS1_OAEP_PADDING,
  oaepHash: 'sha256',
} as const
