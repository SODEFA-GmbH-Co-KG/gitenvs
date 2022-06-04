import { encryptSecret } from '../lib/encryptSecret'
import { prompt } from '../lib/prompt'
import { Keys } from '../lib/types/Keys'

export const encrypt = async ({
  stage,
  keys,
}: {
  stage: string
  keys: Keys<string>
}) => {
  const toEncrypt = await prompt('Enter a value to encrypt: ')
  console.log({ toEncrypt })

  const encrypted = encryptSecret({
    toEncrypt,
    keys,
    stage,
  })

  console.log('Encrypted value:', encrypted)
}
