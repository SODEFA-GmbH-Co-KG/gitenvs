import { createConnection } from 'net'

const DEFAULT_PORT = 1337
const MAX_PORT = 65535
const LOOPBACK_HOSTS = ['127.0.0.1', '::1'] as const
const CONNECTION_TIMEOUT_MS = 200

const parseBasePort = (port: string | undefined) => {
  const parsedPort = Number.parseInt(port ?? '', 10)

  if (Number.isNaN(parsedPort) || parsedPort < 1 || parsedPort > MAX_PORT) {
    return DEFAULT_PORT
  }

  return parsedPort
}

const canConnectToHost = (port: number, host: (typeof LOOPBACK_HOSTS)[number]) =>
  new Promise<boolean>((resolve, reject) => {
    const socket = createConnection({
      host,
      port,
    })
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) {
        return
      }

      settled = true
      socket.removeAllListeners()
      callback()
    }

    socket.setTimeout(CONNECTION_TIMEOUT_MS)

    socket.once('connect', () => {
      finish(() => {
        socket.destroy()
        resolve(true)
      })
    })

    socket.once('timeout', () => {
      finish(() => {
        socket.destroy()
        resolve(false)
      })
    })

    socket.once('error', (error: NodeJS.ErrnoException) => {
      finish(() => {
        socket.destroy()

        if (
          error.code === 'ECONNREFUSED' ||
          error.code === 'EHOSTUNREACH' ||
          error.code === 'ENETUNREACH' ||
          error.code === 'EADDRNOTAVAIL' ||
          error.code === 'ECONNRESET'
        ) {
          resolve(false)
          return
        }

        reject(error)
      })
    })
  })

const isPortOccupied = async (port: number) => {
  const occupiedStates = await Promise.all(
    LOOPBACK_HOSTS.map((host) => canConnectToHost(port, host)),
  )

  return occupiedStates.some(Boolean)
}

export const getAvailablePort = async (port: string | undefined) => {
  const basePort = parseBasePort(port)

  for (let currentPort = basePort; currentPort <= MAX_PORT; currentPort += 1) {
    if (!(await isPortOccupied(currentPort))) {
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
