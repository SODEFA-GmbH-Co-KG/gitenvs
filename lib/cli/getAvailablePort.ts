import { createServer } from 'net'

const DEFAULT_PORT = 1337
const MAX_PORT = 65535

const parseBasePort = (port: string | undefined) => {
  const parsedPort = Number.parseInt(port ?? '', 10)

  if (Number.isNaN(parsedPort) || parsedPort < 1 || parsedPort > MAX_PORT) {
    return DEFAULT_PORT
  }

  return parsedPort
}

const canListenOnPort = (port: number) =>
  new Promise<boolean>((resolve, reject) => {
    const server = createServer()

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        resolve(false)
        return
      }

      reject(error)
    })

    server.once('listening', () => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve(true)
      })
    })

    server.listen(port, '127.0.0.1')
  })

export const getAvailablePort = async (port: string | undefined) => {
  const basePort = parseBasePort(port)

  for (let currentPort = basePort; currentPort <= MAX_PORT; currentPort += 1) {
    if (await canListenOnPort(currentPort)) {
      return {
        basePort,
        port: currentPort,
      }
    }
  }

  throw new Error(
    `❌ Gitenvs: Could not find a free port starting from ${basePort}.`,
  )
}
