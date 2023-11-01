import {
  base64ToString,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from 'uint8array-extras'

// TODO: Duplicate from src/gitenvs/encryptEnvVar.ts
export type SecretData = {
  encryptedSymmetricKey: string
  iv: string
  encryptedValue: string
}

export const decryptEnvVar = async ({
  encrypted,
  encryptedPrivateKey: privateKeyData,
  passphrase,
}: {
  encrypted: string
  encryptedPrivateKey: string
  passphrase: string
}) => {
  try {
    const { iv, encryptedPrivateKey } = JSON.parse(
      base64ToString(privateKeyData),
    ) as {
      // TODO: zod this
      encryptedPrivateKey: string
      iv: string
    }

    const passphraseKey = await globalThis.crypto.subtle.importKey(
      'raw',
      base64ToUint8Array(passphrase),
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['unwrapKey'],
    )

    const privateKey = await globalThis.crypto.subtle.unwrapKey(
      'pkcs8',
      base64ToUint8Array(encryptedPrivateKey),
      passphraseKey,
      {
        name: 'AES-GCM',
        iv: base64ToUint8Array(iv),
      },
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' },
      },
      false,
      ['unwrapKey'],
    )

    const secretData = JSON.parse(base64ToString(encrypted)) as SecretData // TODO: zod this
    const symmetricKey = await globalThis.crypto.subtle.unwrapKey(
      'raw',
      base64ToUint8Array(secretData.encryptedSymmetricKey),
      privateKey,
      {
        name: 'RSA-OAEP',
      },
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt'],
    )

    const decrypted = await globalThis.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64ToUint8Array(secretData.iv),
      },
      symmetricKey,
      base64ToUint8Array(secretData.encryptedValue),
    )

    const plaintext = new TextDecoder().decode(decrypted)

    return plaintext
  } catch (error) {
    console.log('error', error)
  }
}

const encryptSymmetric = async ({ plaintext }: { plaintext: string }) => {
  const encoded = new TextEncoder().encode(plaintext)

  const symmetricKey = await globalThis.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt'],
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    symmetricKey,
    encoded,
  )

  return {
    iv: uint8ArrayToBase64(iv),
    encryptedValue: uint8ArrayToBase64(new Uint8Array(encrypted)),
    symmetricKey,
  }
}
