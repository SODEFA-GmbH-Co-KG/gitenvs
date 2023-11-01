import { getEncryptionToken } from './utils/getEncryptionToken'

export async function register() {
  // console.log(`The encryption token is ${getEncryptionToken()}`)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: open } = await import('open')
    await open(
      `http://localhost:${
        process.env.PORT ?? 3000
      }/#token=${getEncryptionToken()}`,
    )
  }
}
