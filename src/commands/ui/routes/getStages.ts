import { IncomingMessage, ServerResponse } from 'http'
import { Keys } from '../../../lib/types/Keys'

export const getStages = async ({
  keys,
  res,
}: {
  req: IncomingMessage
  res: ServerResponse
  keys: Keys<string>
}) => {
  const stages = Object.keys(keys)
  res.statusCode = 200
  res.end(JSON.stringify(stages))
}
