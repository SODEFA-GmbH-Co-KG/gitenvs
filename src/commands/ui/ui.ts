import { createServer } from 'http'
import url from 'url'
import { MainOptions } from '../../main'
import { decryptedEnvs } from './routes/decryptedEnvs'
import { encrypt } from './routes/encrypt'
import { getStages } from './routes/getStages'
import { mainPage } from './routes/mainPage/mainPage'

export const ui = (options: MainOptions<string>) => {
  const server = createServer(async (req, res) => {
    //type safety
    if (!req.url) {
      res.statusCode = 400
      res.end('No url')
      return
    }

    //parse url to extract pathname from eventual query params - these are not routing relevant
    const reqUrl = url.parse(req.url).pathname

    if (req.method === 'GET' && reqUrl === '/') {
      return mainPage(req, res)
    }

    if (req.method === 'GET' && reqUrl === '/getStages') {
      return getStages({ req, res, keys: options.keys })
    }

    if (req.method === 'POST' && reqUrl === '/decryptedEnvs') {
      return decryptedEnvs({ ...options, req, res })
    }

    if (req.method === 'POST' && reqUrl === '/encrypt') {
      return encrypt({ ...options, req, res })
    }
  })

  server.listen(1337, () => {
    console.log('Server running at http://localhost:1337/')
  })
}
