import { createServer } from 'http'
import { MainOptions } from '../../lib/main'
import { decryptedEnvs } from './routes/decryptedEnvs'
import { encrypt } from './routes/encrypt'
import { mainPage } from './routes/mainPage/mainPage'

export const ui = (options: MainOptions<string>) => {
  const server = createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      return mainPage(req, res)
    }

    if (req.method === 'POST' && req.url === '/decryptedEnvs') {
      return decryptedEnvs({ ...options, req, res })
    }

    if (req.method === 'POST' && req.url === '/encrypt') {
      return encrypt({ ...options, req, res })
    }
  })

  server.listen(1337, () => {
    console.log('Server running at http://localhost:1337/')
  })
}
