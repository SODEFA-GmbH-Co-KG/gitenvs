import { IncomingMessage, ServerResponse } from 'http'
import { flatten, map } from 'lodash'
import { decryptEnvFiles } from '../../../lib/decryptEnvFiles'
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

  const envFilesDeep = await Promise.all(
    map(stages, async (stage) => {
      const passphrase = body?.[stage]
      const privateKey = keys[stage].encryptedPrivateKey

      const envFiles = await decryptEnvFiles({
        generateEnvFiles,
        stage,
        privateKey,
        passphrase,
      })

      return map(envFiles, (envVar) => ({
        ...envVar,
        stage,
      }))
    }),
  )

  const result = flatten(envFilesDeep)

  res.statusCode = 200
  res.end(JSON.stringify(result))

  // Just a hack to get this as the return type which can be used in the decryption UI
  return result
}
