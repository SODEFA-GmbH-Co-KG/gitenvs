import { getEncryptionTokenOnServer } from './utils/getEncryptionKeyOnServer'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: open } = await import('open')
    await open(
      `http://localhost:${
        process.env.PORT ?? 3000
      }/#token=${getEncryptionTokenOnServer()}`,
    )
  }
}
