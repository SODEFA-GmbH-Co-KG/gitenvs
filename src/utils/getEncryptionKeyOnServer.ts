import { GITENVS_ENCRYPTION_TOKEN_ENV_NAME } from '@/gitenvs/env'
import 'server-only'

import { hexToUint8Array } from 'uint8array-extras'

export const getEncryptionTokenOnServer = () => {
  const encryptionToken = process.env[GITENVS_ENCRYPTION_TOKEN_ENV_NAME] ?? null

  if (!encryptionToken) {
    throw new Error('No encryption token found')
  }

  return encryptionToken
}

export const getEncryptionKeyOnServer = () => {
  return globalThis.crypto.subtle.importKey(
    'raw',
    hexToUint8Array(getEncryptionTokenOnServer()),
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt'],
  )
}
