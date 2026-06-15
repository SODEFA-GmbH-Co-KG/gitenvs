import {
  getIsGitenvsInGitIgnore,
  getIsGitignoreExisting,
} from '@/gitenvs/gitignore'
import {
  checkGitenvsJsonExists,
  getGitenvs,
  getGitenvsVersion,
  getIsLatestGitenvsVersion,
} from '@/gitenvs/gitenvs'
import { GITENVS_STAGE_ENV_NAME, getPassphraseEnvName } from '@/gitenvs/env'
import { getCwd } from '@/gitenvs/getCwd'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { getIsGitenvsInstalled } from '@/gitenvs/installGitenvs'
import { getIsAddedToScripts } from '@/gitenvs/packageJsonScripts'
import { getIsPostInstallScriptExisting } from '@/gitenvs/postinstall'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

const passphraseFileSchema = z.array(
  z.object({
    stageName: z.string(),
    passphrase: z.string(),
  }),
)

export const statusCommandSchema = z.object({
  json: z.boolean().default(false),
})

export type GitenvsStatus = Awaited<ReturnType<typeof collectStatus>>

export const collectStatus = async () => {
  const cwd = getCwd()
  const passphrasePath = join(cwd, PASSPHRASE_FILE_NAME)
  const gitenvsExists = checkGitenvsJsonExists()

  const gitenvs = gitenvsExists ? await getGitenvs() : null
  const version = gitenvsExists ? await getGitenvsVersion() : null
  const latest = gitenvsExists ? await getIsLatestGitenvsVersion() : null

  const passphraseFile = await readFile(passphrasePath, 'utf-8')
    .then((content) => {
      const parsed = passphraseFileSchema.safeParse(JSON.parse(content))
      return {
        exists: true,
        valid: parsed.success,
        stages: parsed.success
          ? parsed.data.map((passphrase) => passphrase.stageName)
          : [],
      }
    })
    .catch(() => ({
      exists: false,
      valid: false,
      stages: [] as string[],
    }))

  const configuredStages = gitenvs?.envStages.map((stage) => stage.name) ?? []
  const missingPassphrases = configuredStages.filter(
    (stageName) => !passphraseFile.stages.includes(stageName),
  )
  const extraPassphrases = passphraseFile.stages.filter(
    (stageName) => !configuredStages.includes(stageName),
  )
  const { foundPackageJson } = await getProjectRoot()
  const packageJson = foundPackageJson
    ? {
        found: true,
        hasGitenvsDependency: await getIsGitenvsInstalled(),
        hasPostinstall: await getIsPostInstallScriptExisting(),
        hasScript: await getIsAddedToScripts(),
      }
    : {
        found: false,
        hasGitenvsDependency: null,
        hasPostinstall: null,
        hasScript: null,
      }

  const gitignore = {
    exists: await getIsGitignoreExisting(),
    includesPassphraseFile: await getIsGitenvsInGitIgnore(),
  }

  const issues = [
    !gitenvsExists ? 'gitenvs.json not found' : null,
    latest === false ? 'gitenvs.json is not on the latest version' : null,
    gitenvsExists && !passphraseFile.exists
      ? `${PASSPHRASE_FILE_NAME} not found`
      : null,
    passphraseFile.exists && !passphraseFile.valid
      ? `${PASSPHRASE_FILE_NAME} is invalid`
      : null,
    passphraseFile.exists && !gitignore.includesPassphraseFile
      ? `${PASSPHRASE_FILE_NAME} is not ignored`
      : null,
    ...missingPassphrases.map(
      (stageName) => `missing passphrase for stage ${stageName}`,
    ),
  ].filter((issue): issue is string => issue !== null)

  return {
    ok: issues.length === 0,
    cwd,
    gitenvs: {
      exists: gitenvsExists,
      version,
      latest,
      stages: configuredStages,
      envFiles:
        gitenvs?.envFiles.map((envFile) => ({
          name: envFile.name,
          filePath: envFile.filePath,
          type: envFile.type,
        })) ?? [],
    },
    passphrases: {
      path: passphrasePath,
      exists: passphraseFile.exists,
      valid: passphraseFile.valid,
      stages: passphraseFile.stages,
      missingStages: missingPassphrases,
      extraStages: extraPassphrases,
    },
    gitignore,
    packageJson,
    ci: {
      stageEnv: GITENVS_STAGE_ENV_NAME,
      passphraseEnvByStage: Object.fromEntries(
        configuredStages.map((stageName) => [
          stageName,
          getPassphraseEnvName({ stage: stageName }),
        ]),
      ) as Record<string, string>,
    },
    issues,
  }
}

const printHumanStatus = (status: GitenvsStatus) => {
  console.log(`Gitenvs status: ${status.ok ? 'ok' : 'needs attention'}`)
  console.log(`cwd: ${status.cwd}`)
  console.log(`gitenvs.json: ${status.gitenvs.exists ? 'found' : 'missing'}`)

  if (status.gitenvs.exists) {
    console.log(`version: ${status.gitenvs.version}`)
    console.log(`stages: ${status.gitenvs.stages.join(', ') || '(none)'}`)
    console.log(
      `env files: ${
        status.gitenvs.envFiles.map((envFile) => envFile.filePath).join(', ') ||
        '(none)'
      }`,
    )
  }

  console.log(
    `${PASSPHRASE_FILE_NAME}: ${
      status.passphrases.exists ? 'found' : 'missing'
    }`,
  )

  if (status.issues.length > 0) {
    console.log('issues:')
    for (const issue of status.issues) {
      console.log(`- ${issue}`)
    }
  }
}

export const statusCommand = async (
  options: z.infer<typeof statusCommandSchema>,
) => {
  const status = await collectStatus()

  if (options.json) {
    console.log(JSON.stringify(status, null, 2))
    return
  }

  printHumanStatus(status)
}
