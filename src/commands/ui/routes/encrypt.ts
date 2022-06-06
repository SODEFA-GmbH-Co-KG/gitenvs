import { IncomingMessage, ServerResponse } from 'http'
import { mapValues } from 'lodash'
import { encryptSecret } from '../../../lib/encryptSecret'
import { MainOptions } from '../../../main'
import { getParsedBody } from '../lib/getParsedBody'

export const encrypt = async ({
  keys,
  req,
  res,
}: MainOptions<string> & {
  req: IncomingMessage
  res: ServerResponse
}) => {
  const body = await getParsedBody<{ toEncrypt: string }>(req)
  const toEncrypt = body?.toEncrypt

  const result = mapValues(keys, (_, stage) =>
    encryptSecret({
      toEncrypt,
      keys,
      stage,
    }),
  )

  res.statusCode = 200
  res.end(JSON.stringify(result))
}
