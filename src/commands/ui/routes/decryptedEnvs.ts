import { IncomingMessage, ServerResponse } from 'http'
import { flatMap, map } from 'lodash'
import { decryptEnvFiles } from '../../../lib/decryptEnvVars'
import { MainOptions } from '../../../main'
import { getParsedBody } from '../lib/getParsedBody'

export const decryptedEnvs = async ({
  keys,
  generateEnvFiles,
  req,
  res,
}: MainOptions<string> & {
  req: IncomingMessage
  res: ServerResponse
}) => {
  const stages = Object.keys(keys)

  const body = await getParsedBody<Record<string, string>>(req)

  const result = flatMap(stages, (stage) => {
    const passphrase = body?.[stage]
    const privateKey = keys[stage].encryptedPrivateKey

    const envVars = decryptEnvFiles({
      generateEnvFiles,
      stage,
      privateKey,
      passphrase,
    })

    return map(envVars, (envVar) => ({
      ...envVar,
      stage,
    }))
  })

  res.statusCode = 200
  res.end(JSON.stringify(result))
}
