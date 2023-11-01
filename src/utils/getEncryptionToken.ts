import { uint8ArrayToHex } from 'uint8array-extras'

let encryptionToken: string | null = null

export const getEncryptionToken = () => {
  if (encryptionToken) {
    return encryptionToken
  }

  if (typeof window !== 'undefined') {
    const hashString = location.hash.substring(1)
    const hashParams = new URLSearchParams(hashString)
    encryptionToken = hashParams.get('token')
    return encryptionToken
  }

  if (!encryptionToken) {
    encryptionToken = uint8ArrayToHex(
      globalThis.crypto.getRandomValues(new Uint8Array(32)),
    )
  }

  return encryptionToken
}
