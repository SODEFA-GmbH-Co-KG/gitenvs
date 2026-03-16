import { createServer } from 'net'
import { getAvailablePort } from '../lib/cli/getAvailablePort'

const DEFAULT_PORT = 1337

const startDummyServer = async (port: number) => {
  const server = createServer((socket) => {
    socket.on('error', () => {})
    socket.end('occupied')
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => resolve())
  })

  return server
}

const main = async () => {
  const basePort = process.env.PORT ?? String(DEFAULT_PORT)
  const occupiedPort = Number.parseInt(basePort, 10)
  const dummyServer = await startDummyServer(occupiedPort)

  try {
    const result = await getAvailablePort(basePort)

    console.log(
      `Base port ${result.basePort} is occupied. Resolved free port: ${result.port}`,
    )

    if (result.port === result.basePort) {
      throw new Error('Port fallback failed.')
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      dummyServer.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }
}

await main()
