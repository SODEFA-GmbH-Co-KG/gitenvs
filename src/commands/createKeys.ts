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

  console.log({
    publicKey: Buffer.from(publicKey, 'utf8').toString('base64'),
    encryptedPrivateKey: Buffer.from(privateKey, 'utf8').toString('base64'),
  })

  console.log(
    'DO NOT SHARE! Your passphrase for the private key is:',
    passphrase,
  )
}
