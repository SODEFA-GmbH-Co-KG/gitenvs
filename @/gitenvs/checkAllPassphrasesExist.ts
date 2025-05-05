import { readFile } from 'fs/promises'
import { every, map } from 'lodash-es'
import { join } from 'path'
import { getCwd } from './getCwd'
import { getIsGitenvsExisting } from './getIsGitenvsExisting'
import { PASSPHRASE_FILE_NAME } from './getPassphrase'
import { getGitenvs } from './gitenvs'
import { type Passphrase } from './gitenvs.schema'

export const getAllPassphrasesOrThrow = async () => {
  const passphrasePath = join(getCwd(), PASSPHRASE_FILE_NAME)
  const currentFileContent = await readFile(passphrasePath, 'utf-8')
    .then((res) => JSON.parse(res) as Passphrase[])
    .catch(() => {
      throw new Error(`Did not find passphrases file at ${passphrasePath}.`)
    })

  const isGitenvsExisting = await getIsGitenvsExisting()

  if (!isGitenvsExisting) {
    throw new Error(`Did not find gitenvs.json.`)
  }

  const gitenvs = await getGitenvs()

  const allGitenvStages = map(gitenvs.envStages, (es) => es.name)

  const allPassphrasesExists = every(allGitenvStages, (stage) => {
    const requestedPassphrase = currentFileContent.find(
      (p) => p.stageName === stage,
    )?.passphrase
    return !!requestedPassphrase
  })

  if (!allPassphrasesExists) {
    throw new Error(`Did not find all passphrases in file ${passphrasePath}.`)
  }

  return { passphrases: currentFileContent, gitenvs }
}
