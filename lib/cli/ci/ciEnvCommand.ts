import { GITENVS_STAGE_ENV_NAME, getPassphraseEnvName } from '@/gitenvs/env'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { z } from 'zod'

export const ciEnvCommandSchema = z.object({
  stage: z.string().optional(),
  json: z.boolean().default(false),
})

export const ciEnvCommand = async (
  options: z.infer<typeof ciEnvCommandSchema>,
) => {
  const gitenvs = await getGitenvs()
  const stage = options.stage ?? process.env[GITENVS_STAGE_ENV_NAME]

  if (!stage) {
    console.error(
      `❌ Gitenvs: Stage is required. Set --stage <stage> or ${GITENVS_STAGE_ENV_NAME}.`,
    )
    process.exit(1)
  }

  if (!gitenvs.envStages.some((envStage) => envStage.name === stage)) {
    const available = gitenvs.envStages.map((envStage) => envStage.name)
    console.error(
      `❌ Gitenvs: Stage not found: ${stage}. Available: ${
        available.join(', ') || '(none)'
      }`,
    )
    process.exit(1)
  }

  const result = {
    stage,
    stageEnv: GITENVS_STAGE_ENV_NAME,
    passphraseEnv: getPassphraseEnvName({ stage }),
    passphraseFile: PASSPHRASE_FILE_NAME,
    envFiles: gitenvs.envFiles.map((envFile) => ({
      name: envFile.name,
      filePath: envFile.filePath,
      type: envFile.type,
    })),
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  console.log(`${result.stageEnv}=${result.stage}`)
  console.log(`${result.passphraseEnv}=<set ${stage} passphrase here>`)
}
