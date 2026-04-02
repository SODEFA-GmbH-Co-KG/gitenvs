import { getEncryptionTokenOnServer } from './utils/getEncryptionKeyOnServer'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const url = `http://localhost:${
      process.env.PORT ?? 3000
    }/#token=${getEncryptionTokenOnServer()}`

    const { exec } = await import('node:child_process')
    const command =
      process.platform === 'win32'
        ? `start "" "${url}"`
        : process.platform === 'darwin'
          ? `open "${url}"`
          : `xdg-open "${url}"`
    exec(command)
  }
}
