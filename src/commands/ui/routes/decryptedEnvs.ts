import { IncomingMessage, ServerResponse } from 'http'
import { flatMap, map } from 'lodash'
import { decryptEnvVars } from '../../../lib/decryptEnvVars'
import { MainOptions } from '../../../lib/main'
import { getParsedBody } from '../lib/getParsedBody'

export const decryptedEnvs = async ({
  keys,
  generateEnvVars,
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

    const envVars = decryptEnvVars({
      generateEnvVars,
      stage,
      privateKey,
      passphrase,
    })

    return map(envVars, (envVar) => ({
      ...envVar,
      value: envVar.value ?? '',
      stage,
    }))
  })

  res.statusCode = 200
  res.end(JSON.stringify(result))
}
