import { hexToUint8Array } from 'uint8array-extras'

let encryptionToken: string | null = null

const getEncryptionTokenOnClient = () => {
  if (encryptionToken) {
    return encryptionToken
  }

  if (typeof window !== 'undefined') {
    const hashString = location.hash.substring(1)
    const hashParams = new URLSearchParams(hashString)
    encryptionToken = hashParams.get('token')
    if (!encryptionToken) {
      throw new Error('No encryption token found in URL hash')
    }
    return encryptionToken
  }

  if (!encryptionToken) {
    throw new Error('No encryption token found')
  }

  return encryptionToken
}

export const getEncryptionKeyOnClient = () => {
  return globalThis.crypto.subtle.importKey(
    'raw',
    hexToUint8Array(getEncryptionTokenOnClient()),
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt'],
  )
}
