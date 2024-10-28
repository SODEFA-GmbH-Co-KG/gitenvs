import {
  base64ToUint8Array,
  stringToUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToString,
} from 'uint8array-extras'

export const decryptWithEncryptionKey = async ({
  encryptedValue,
  iv,
  key,
}: {
  encryptedValue: string
  iv: string
  key: CryptoKey
}) => {
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

export type EncryptedValue = Awaited<
  ReturnType<typeof encryptWithEncryptionKey>
>

export const encryptWithEncryptionKey = async ({
  plaintext,
  key,
}: {
  plaintext: string
  key: CryptoKey
}) => {
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
