import { IncomingMessage } from 'http'

export const getParsedBody = <Body>(req: IncomingMessage): Promise<Body> => {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: any) => {
      body += chunk
    })
    req.on('end', () => {
      resolve(JSON.parse(body || '{}'))
    })
  })
}
