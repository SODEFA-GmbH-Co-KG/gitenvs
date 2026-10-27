import { EventEmitter } from 'events'
import type * as Net from 'net'
import { createServer } from 'net'
import { afterEach, expect, test, vi } from 'vitest'
import { getAvailablePort } from './getAvailablePort'

// simulate a system without IPv6 (e.g. some containers and CI runners)
vi.mock('net', async (importOriginal) => {
  const net = await importOriginal<typeof Net>()
  return {
    ...net,
    createConnection: (options: { host: string; port: number }) => {
      if (options.host !== '::1') return net.createConnection(options)

      const socket = Object.assign(new EventEmitter(), {
        setTimeout: () => socket,
        destroy: () => socket,
      })
      setImmediate(() =>
        socket.emit(
          'error',
          Object.assign(new Error('connect EAFNOSUPPORT ::1'), {
            code: 'EAFNOSUPPORT',
          }),
        ),
      )
      return socket
    },
  }
})

const servers: ReturnType<typeof createServer>[] = []

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
  )
})

test('works without IPv6', async () => {
  await expect(getAvailablePort('41337')).resolves.toEqual({
    basePort: 41337,
    port: 41337,
  })
})

test('still finds the next free IPv4 port without IPv6', async () => {
  const server = createServer()
  servers.push(server)
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(41337, '127.0.0.1', () => resolve())
  })

  await expect(getAvailablePort('41337')).resolves.toEqual({
    basePort: 41337,
    port: 41338,
  })
})
