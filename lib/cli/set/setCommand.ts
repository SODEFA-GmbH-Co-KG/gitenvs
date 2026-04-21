import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getGitenvs, getIsLatestGitenvsVersion } from '@/gitenvs/gitenvs'
import { upsertEnvVarValue } from '@/gitenvs/upsertEnvVar'
import { z } from 'zod'

export const setCommandSchema = z.object({
  file: z.string().min(1, '--file is required'),
  key: z.string().min(1, '--key is required'),
  value: z.string(),
  stage: z.string().optional(),
  encrypt: z.boolean().default(true),
})

export const setCommand = async (
  options: z.infer<typeof setCommandSchema>,
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

  const envFile = gitenvs.envFiles.find((f) => f.filePath === options.file)
  if (!envFile) {
    const available = gitenvs.envFiles.map((f) => f.filePath).join(', ')
    console.error(
      `❌ Gitenvs: File not found: ${options.file}. Available: ${available || '(none)'}`,
    )
    process.exit(1)
  }

  const targetStages = options.stage
    ? gitenvs.envStages.filter((s) => s.name === options.stage)
    : gitenvs.envStages

  if (options.stage && targetStages.length === 0) {
    const available = gitenvs.envStages.map((s) => s.name).join(', ')
    console.error(
      `❌ Gitenvs: Stage not found: ${options.stage}. Available: ${available || '(none)'}`,
    )
    process.exit(1)
  }

  for (const stage of targetStages) {
    await upsertEnvVarValue({
      fileId: envFile.id,
      stage: stage.name,
      key: options.key,
      value: options.value,
      encrypt: options.encrypt,
    })

    const indicator = options.encrypt ? '🔒' : '🔓'
    console.log(
      `${indicator} Gitenvs: Set ${options.key} in ${envFile.filePath} for stage ${stage.name}`,
    )
  }
}
