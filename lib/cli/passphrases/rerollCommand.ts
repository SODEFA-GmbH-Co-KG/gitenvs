import { BACKUP_DIR_NAME } from '@/gitenvs/getPassphrase'
import { rerollPassphrases } from '@/gitenvs/rerollPassphrases'
import { z } from 'zod'

export const passphrasesRerollCommandSchema = z.object({
  stages: z.string().optional(),
  yes: z.boolean().default(false),
  json: z.boolean().default(false),
})

const HISTORY_WARNING =
  'Old passphrases can still decrypt gitenvs.json from git history. If a passphrase leaked, rotate the secrets themselves as well.'

const parseStageNames = (stages?: string) =>
  stages
    ?.split(',')
    .map((stage) => stage.trim())
    .filter(Boolean)

export const passphrasesRerollCommand = async (
  options: z.infer<typeof passphrasesRerollCommandSchema>,
) => {
  const fail = (error: string) => {
    if (options.json) {
      console.log(JSON.stringify({ ok: false, error }, null, 2))
    } else {
      console.error(`❌ Gitenvs: ${error}`)
    }
    process.exitCode = 1
  }

  if (!options.yes) {
    return fail(
      'Rerolling replaces the passphrases and re-encrypts all values of the selected stages. Every place that uses the old passphrases (CI, hosting providers, password manager) has to be updated afterwards. Re-run with --yes to confirm.',
    )
  }

  let result: Awaited<ReturnType<typeof rerollPassphrases>>
  try {
    result = await rerollPassphrases({
      stageNames: parseStageNames(options.stages),
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error))
  }

  const warnings = [
    ...result.staleEnvNames.map(
      (name) =>
        `${name} is set in the current environment and still holds the old passphrase`,
    ),
    `${BACKUP_DIR_NAME}/ contains the old passphrases – delete it once the new passphrases are deployed`,
    HISTORY_WARNING,
  ]

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          stages: result.stages,
          reencryptedValues: result.reencryptedValues,
          passphrasePath: result.passphrasePath,
          backupDir: result.backupDir,
          passphraseEnvNames: result.passphraseEnvNames,
          warnings,
        },
        null,
        2,
      ),
    )
    return
  }

  console.log(
    `✅ Gitenvs: Rerolled passphrases for ${result.stages.join(', ')} (${result.reencryptedValues} ${result.reencryptedValues === 1 ? 'value' : 'values'} re-encrypted)`,
  )
  console.log(`🔑 New passphrases: ${result.passphrasePath}`)
  console.log(`💾 Backup: ${result.backupDir}`)
  console.log('👉 Update these env vars wherever gitenvs create runs:')
  for (const name of result.passphraseEnvNames) {
    console.log(`- ${name}`)
  }
  for (const warning of warnings) {
    console.log(`⚠️ ${warning}`)
  }
}
