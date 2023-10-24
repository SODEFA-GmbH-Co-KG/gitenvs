import { generateKeyPairSync, randomBytes } from 'crypto'

export const createKeys = async () => {
  const passphrase = randomBytes(256).toString('base64')

  // FROM: https://stackoverflow.com/a/53173811/5730346
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki', // recommended to be 'spki' by the Node.js docs
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8', // recommended to be 'pkcs8' by the Node.js docs
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase,
    },
  })

  return {
    publicKey,
    privateKey,
    passphrase,
  }
}
