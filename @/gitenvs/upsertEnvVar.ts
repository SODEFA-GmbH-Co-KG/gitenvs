import { find } from 'lodash-es'
import { encryptEnvVar } from './encryptEnvVar'
import { getGitenvs, saveGitenvs } from './gitenvs'
import { getNewEnvFileId } from './idsGenerator'

export const upsertEnvVarValue = async ({
  fileId,
  stage,
  key,
  value,
  encrypt,
}: {
  fileId: string
  stage: string
  key: string
  value: string
  encrypt: boolean
}) => {
  const gitenvs = await getGitenvs()

  const envStage = find(gitenvs.envStages, (s) => s.name === stage)
  if (!envStage) {
    throw new Error(`Env stage not found: ${stage}`)
  }

  const file = find(gitenvs.envFiles, (f) => f.id === fileId)
  if (!file) {
    // TODO: Create file
    throw new Error(`File not found: ${fileId}`)
  }

  let envVar = find(
    gitenvs.envVars,
    (v) => v.fileId === file.id && v.key === key,
  )
  if (!envVar) {
    envVar = {
      id: getNewEnvFileId(),
      fileId: file.id,
      key,
      values: {},
    }
    gitenvs.envVars.push(envVar)
  }

  const valueToSave = encrypt
    ? await encryptEnvVar({
        plaintext: value,
        publicKey: envStage.publicKey,
      })
    : value

  envVar.values[stage] = {
    value: valueToSave,
    encrypted: encrypt,
  }

  await saveGitenvs(gitenvs)
}
