import {
  base64ToUint8Array,
  hexToUint8Array,
  stringToUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToString,
} from 'uint8array-extras'

let encryptionToken: string | null = null

export const getEncryptionToken = () => {
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
    encryptionToken = process.env.GITENVS_ENCRYPTION_TOKEN ?? null
  }

  if (!encryptionToken) {
    throw new Error('No encryption token found')
  }

  return encryptionToken
}

const getKey = () => {
  return globalThis.crypto.subtle.importKey(
    'raw',
    hexToUint8Array(getEncryptionToken()),
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt'],
  )
}

export const decryptWithEncryptionToken = async ({
  encryptedValue,
  iv,
}: {
  encryptedValue: string
  iv: string
}) => {
  const key = await getKey()

  const decrypted = await globalThis.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToUint8Array(iv),
    },
    key,
    base64ToUint8Array(encryptedValue),
  )
  return uint8ArrayToString(new Uint8Array(decrypted))
}

export const encryptWithEncryptionToken = async ({
  plaintext,
}: {
  plaintext: string
}) => {
  const key = await getKey()
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await globalThis.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    stringToUint8Array(plaintext),
  )

  return {
    iv: uint8ArrayToBase64(iv),
    encryptedValue: uint8ArrayToBase64(new Uint8Array(encrypted)),
  }
}
