import {
  base64ToString,
  stringToBase64,
  uint8ArrayToBase64,
} from 'uint8array-extras'

export type SecretData = {
  encryptedSymmetricKey: string
  iv: string
  encryptedValue: string
}

export const encryptEnvVar = async ({
  plaintext,
  publicKey,
}: {
  plaintext: string
  publicKey: string
}) => {
  try {
    const symmetricEncrypted = await encryptSymmetric({ plaintext })
    const jsonWebKey = JSON.parse(base64ToString(publicKey)) as JsonWebKey

    console.log('jsonWebKey', jsonWebKey)

    const pubKey = await globalThis.crypto.subtle.importKey(
      'jwk',
      // TODO: zod this
      jsonWebKey,
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' },
      },
      false,
      ['wrapKey'],
    )
    // TODO: Remove
    // .then(function (result) {
    //   console.log('imported public key', result)
    //   return result
    // })
    // .catch(function (err) {
    //   console.log('error', err)
    // })

    const encryptedSymmetricKey = await crypto.subtle.wrapKey(
      'raw',
      symmetricEncrypted.symmetricKey,
      pubKey,
      {
        name: pubKey.algorithm.name,
      },
    )

    const secretData: SecretData = {
      encryptedValue: symmetricEncrypted.encryptedValue,
      iv: symmetricEncrypted.iv,
      encryptedSymmetricKey: uint8ArrayToBase64(
        new Uint8Array(encryptedSymmetricKey),
      ),
    }

    const stringified = JSON.stringify(secretData)

    return stringToBase64(stringified)
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
