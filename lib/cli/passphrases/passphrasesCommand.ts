import { collectStatus } from '../status/statusCommand'
import { z } from 'zod'

export const passphrasesValidateCommandSchema = z.object({
  json: z.boolean().default(false),
})

export const passphrasesValidateCommand = async (
  options: z.infer<typeof passphrasesValidateCommandSchema>,
) => {
  const status = await collectStatus()
  const issues = [
    status.gitenvs.latest === false
      ? 'gitenvs.json is not on the latest version'
      : null,
    !status.passphrases.exists ? 'passphrase file not found' : null,
    status.passphrases.exists && !status.passphrases.valid
      ? 'passphrase file is invalid'
      : null,
    ...status.passphrases.missingStages.map(
      (stageName) => `missing passphrase for stage ${stageName}`,
    ),
  ].filter((issue): issue is string => issue !== null)

  const result = {
    ok: issues.length === 0,
    path: status.passphrases.path,
    stages: status.passphrases.stages,
    missingStages: status.passphrases.missingStages,
    extraStages: status.passphrases.extraStages,
    issues,
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (result.ok) {
    console.log('✅ Gitenvs: passphrase file is valid')
  } else {
    console.log('❌ Gitenvs: passphrase file is invalid')
    for (const issue of result.issues) {
      console.log(`- ${issue}`)
    }
  }

  if (!result.ok) {
    process.exitCode = 1
  }
}
