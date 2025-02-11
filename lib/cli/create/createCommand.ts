import { GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { getCwd } from '@/gitenvs/getCwd'
import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getPassphrase, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs, getIsLatestGitenvsVersion } from '@/gitenvs/gitenvs'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { getFileContent } from './getFileContent'

export const createCommandSchema = z.object({
  stage: z.string(),
  passphrase: z.string().optional(),
  passphrasePath: z.string().optional(),
})

export const createCommand = async (
  options: z.infer<typeof createCommandSchema>,
) => {
  const gitenvsExists = await getIsGitenvsExisting()
  if (!gitenvsExists) {
    console.error('❌ Gitenvs: gitenvs.json not found')
    process.exit(1)
  }

  const isLatestGitenvsVersion = await getIsLatestGitenvsVersion()
  if (!isLatestGitenvsVersion) {
    console.error(
      `❌ Gitenvs: Version is not latest. Please run \`gitenvs migrate\` to migrate to the latest version.`,
    )
    process.exit(1)
  }

  const gitenvs = await getGitenvs()
  const stage = process.env[GITENVS_STAGE_ENV_NAME] ?? options.stage

  if (!stage) {
    console.error(
      `Stage is required. Set it with --stage <stage> or with env var: ${GITENVS_STAGE_ENV_NAME}`,
    )
    process.exit(1)
  }

  const envStage = gitenvs.envStages.find((envStage) => envStage.name === stage)
  if (!envStage) {
    console.error(`Env stage ${stage} not found`)
    process.exit(1)
  }

  const passphrase = await getPassphrase({
    stage: stage,
    passphrase: options.passphrase,
    passphrasePath: options.passphrasePath,
  })

  if (!passphrase) {
    console.error(
      `Requested passphrase for stage ${stage} not found in ${options.passphrasePath ?? join(getCwd(), PASSPHRASE_FILE_NAME)}`,
    )
    process.exit(1)
  }

  const filePromises = gitenvs.envFiles.map(async (envFile) => {
    console.log(`🔒 Gitenvs: Creating ${envFile.name} file for stage: ${stage}`)

    const fileContent = await getFileContent({
      gitenvs,
      envFile,
      envStage,
      passphrase,
    })

    return writeFile(join(getCwd(), envFile.filePath), fileContent, 'utf-8')
  })

  await Promise.allSettled(filePromises)
}
