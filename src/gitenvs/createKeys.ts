import { stringToBase64, uint8ArrayToBase64 } from 'uint8array-extras'

export const createKeys = async () => {
  const rsaKeys = await globalThis.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    true,
    ['encrypt', 'decrypt'],
  )

  const publicKeyAsJwk = await globalThis.crypto.subtle.exportKey(
    'jwk',
    rsaKeys.publicKey,
  )

  const publicKey = stringToBase64(JSON.stringify(publicKeyAsJwk))

  const passphraseKey = await globalThis.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['wrapKey'],
  )

  const passphrase = await globalThis.crypto.subtle.exportKey(
    'raw',
    passphraseKey,
  )

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const encryptedPrivateKey = await globalThis.crypto.subtle.wrapKey(
    'pkcs8',
    rsaKeys.privateKey,
    passphraseKey,
    {
      name: 'AES-GCM',
      iv: iv,
      // tagLength: 128,
    },
  )

  const encryptedPrivateKeyWithIv = JSON.stringify({
    iv: uint8ArrayToBase64(iv),
    encryptedPrivateKey: uint8ArrayToBase64(
      new Uint8Array(encryptedPrivateKey),
    ),
  })

  return {
    publicKey,
    encryptedPrivateKey: stringToBase64(encryptedPrivateKeyWithIv),
    passphrase: uint8ArrayToBase64(new Uint8Array(passphrase)),
  }
}
