import { getEncryptionTokenOnServer } from './utils/getEncryptionKeyOnServer'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Use the address the server listens on. "localhost" may resolve to ::1,
    // where another local process could listen and grab the token.
    const url = `http://127.0.0.1:${
      process.env.PORT ?? 3000
    }/auth?token=${getEncryptionTokenOnServer()}`

    console.log(`🔑 Gitenvs: If your browser does not open, visit ${url}`)

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
