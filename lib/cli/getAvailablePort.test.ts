import { createServer } from 'net'
import { afterEach, expect, test } from 'vitest'
import { getAvailablePort } from './getAvailablePort'

const servers: ReturnType<typeof createServer>[] = []

const listen = async (port: number) => {
  const server = createServer()
  servers.push(server)

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => resolve())
  })
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error)
              return
            }

            resolve()
          })
        }),
    ),
  )
})

test('uses the requested port when it is free', async () => {
  await expect(getAvailablePort('1337')).resolves.toEqual({
    basePort: 1337,
    port: 1337,
  })
})

test('increments to the next free port when the requested port is occupied', async () => {
  await listen(1337)
  await listen(1338)

  await expect(getAvailablePort('1337')).resolves.toEqual({
    basePort: 1337,
    port: 1339,
  })
})

test('treats an ipv6 localhost listener as occupied', async () => {
  const server = createServer()
  servers.push(server)

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(1337, '::1', () => resolve())
  })

  await expect(getAvailablePort('1337')).resolves.toEqual({
    basePort: 1337,
    port: 1338,
  })
})

test('falls back to the default port when PORT is invalid', async () => {
  await expect(getAvailablePort('not-a-number')).resolves.toEqual({
    basePort: 1337,
    port: 1337,
  })
})
