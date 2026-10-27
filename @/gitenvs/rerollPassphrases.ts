import { constants } from 'fs'
import { access, mkdir, readFile, rename, writeFile } from 'fs/promises'
import { basename, dirname, join } from 'path'
import { createKeys } from './createKeys'
import { decryptEnvVar } from './decryptEnvVar'
import { encryptEnvVar } from './encryptEnvVar'
import { getPassphraseEnvName } from './env'
import { getCwd } from './getCwd'
import { getProjectRoot } from './getProjectRoot'
import { BACKUP_DIR_NAME, PASSPHRASE_FILE_NAME } from './getPassphrase'
import {
  checkGitenvsJsonExists,
  getGitenvs,
  getIsLatestGitenvsVersion,
  saveGitenvs,
} from './gitenvs'
import { Passphrase, type EnvVar, type Gitenvs } from './gitenvs.schema'
import { addBackupDirToGitIgnore } from './gitignore'

/**
 * Creates new keys for the given stages and re-encrypts all their values.
 * Pure: does not touch the file system. Throws if any value cannot be
 * re-encrypted, so a failed reroll never leaves values that can't be
 * decrypted anymore.
 */
export const rerollStages = async ({
  gitenvs,
  passphrases,
  stageNames,
}: {
  gitenvs: Gitenvs
  passphrases: Passphrase[]
  stageNames: string[]
}) => {
  stageNames = [...new Set(stageNames)]
  if (stageNames.length === 0) {
    throw new Error('No stages to reroll.')
  }

  const newKeysByStage = new Map<
    string,
    Awaited<ReturnType<typeof createKeys>>
  >()
  for (const stageName of stageNames) {
    if (!gitenvs.envStages.some((s) => s.name === stageName)) {
      const available = gitenvs.envStages.map((s) => s.name).join(', ')
      throw new Error(
        `Stage not found: ${stageName}. Available: ${available || '(none)'}`,
      )
    }
    newKeysByStage.set(stageName, await createKeys())
  }

  const reencryptValue = async ({
    envVar,
    stageName,
  }: {
    envVar: EnvVar
    stageName: string
  }) => {
    const value = envVar.values[stageName]!
    const oldStage = gitenvs.envStages.find((s) => s.name === stageName)!
    const newKeys = newKeysByStage.get(stageName)!

    const passphrase = passphrases.find(
      (p) => p.stageName === stageName,
    )?.passphrase
    if (!passphrase) {
      throw new Error(
        `No passphrase found for stage ${stageName}. Add it to ${PASSPHRASE_FILE_NAME} or set ${getPassphraseEnvName({ stage: stageName })}.`,
      )
    }

    const plaintext = await decryptEnvVar({
      encrypted: value.value,
      encryptedPrivateKey: oldStage.encryptedPrivateKey,
      passphrase,
    })
    if (plaintext === undefined) {
      throw new Error(
        `Could not decrypt ${envVar.key} for stage ${stageName}. Is the passphrase correct?`,
      )
    }

    const encrypted = await encryptEnvVar({
      plaintext,
      publicKey: newKeys.publicKey,
    })

    const check = await decryptEnvVar({
      encrypted,
      encryptedPrivateKey: newKeys.encryptedPrivateKey,
      passphrase: newKeys.passphrase,
    })
    if (check !== plaintext) {
      throw new Error(
        `Verification failed for ${envVar.key} in stage ${stageName}.`,
      )
    }

    return { ...value, value: encrypted }
  }

  let reencryptedValues = 0
  const envVars: EnvVar[] = []
  for (const envVar of gitenvs.envVars) {
    const values = { ...envVar.values }
    for (const stageName of stageNames) {
      if (!values[stageName]?.encrypted) continue
      values[stageName] = await reencryptValue({ envVar, stageName })
      reencryptedValues++
    }
    envVars.push({ ...envVar, values })
  }

  return {
    gitenvs: {
      ...gitenvs,
      envStages: gitenvs.envStages.map((stage) => {
        const newKeys = newKeysByStage.get(stage.name)
        if (!newKeys) return stage
        return {
          name: stage.name,
          publicKey: newKeys.publicKey,
          encryptedPrivateKey: newKeys.encryptedPrivateKey,
        }
      }),
      envVars,
    } satisfies Gitenvs,
    passphrases: stageNames.map((stageName) => ({
      stageName,
      passphrase: newKeysByStage.get(stageName)!.passphrase,
    })) satisfies Passphrase[],
    reencryptedValues,
  }
}

const readPassphraseFile = async (path: string) => {
  const content = await readFile(path, 'utf-8').catch(() => null)
  if (content === null) return null

  const parsed = Passphrase.array().safeParse(JSON.parse(content))
  if (!parsed.success) {
    throw new Error(`${PASSPHRASE_FILE_NAME} is invalid.`)
  }
  return parsed.data
}

const assertWritable = async (paths: string[]) => {
  for (const path of paths) {
    // check the directory if the file does not exist yet
    const target = await access(path)
      .then(() => path)
      .catch(() => dirname(path))
    await access(target, constants.W_OK).catch(() => {
      throw new Error(`No write access to ${target}.`)
    })
  }
}

// the tmp file lives in the (ignored) backup dir so a crash never leaves
// secrets in a file that could be committed
const writeFileAtomic = async (
  path: string,
  content: string,
  tmpDir: string,
) => {
  const tmpPath = join(tmpDir, `${basename(path)}.tmp`)
  await writeFile(tmpPath, content, { encoding: 'utf-8', mode: 0o600 })
  await rename(tmpPath, path)
}

export type PassphraseSource = 'file' | 'env'

const getPassphraseSources = async () => {
  const passphrasePath = join(getCwd(), PASSPHRASE_FILE_NAME)
  const passphraseFile = await readPassphraseFile(passphrasePath)
  return {
    passphrasePath,
    passphraseFile,
    fromFile: (stageName: string) =>
      passphraseFile?.find((p) => p.stageName === stageName)?.passphrase ||
      undefined,
    fromEnv: (stageName: string) =>
      process.env[getPassphraseEnvName({ stage: stageName })] || undefined,
  }
}

/**
 * Secret-free overview where the passphrase of each stage would come from.
 */
export const getRerollStatus = async () => {
  const gitenvs = await getGitenvs()
  const { fromFile, fromEnv } = await getPassphraseSources()

  return gitenvs.envStages.map((stage) => {
    const file = fromFile(stage.name)
    const env = fromEnv(stage.name)
    return {
      stageName: stage.name,
      envName: getPassphraseEnvName({ stage: stage.name }),
      inFile: !!file,
      inEnv: !!env,
      conflict: !!file && !!env && file !== env,
      encryptedValues: gitenvs.envVars.filter(
        (v) => v.values[stage.name]?.encrypted,
      ).length,
    }
  })
}

/**
 * Rerolls the passphrases of the given stages (default: all) in the current
 * gitenvs project. Old gitenvs.json and passphrases are backed up to
 * gitenvs.backups/<timestamp>/ before anything is overwritten.
 *
 * Old passphrases are taken from `passphrases` (e.g. entered in the browser),
 * otherwise from gitenvs.passphrases.json or GITENVS_PASSPHRASE_<STAGE>. If
 * both are set with different values, `passphraseSources` has to say which
 * one to use.
 *
 * With dryRun everything is checked and re-encrypted in memory, but nothing
 * is written.
 */
export const rerollPassphrases = async ({
  stageNames: requestedStageNames,
  passphrases = [],
  passphraseSources = {},
  dryRun = false,
}: {
  stageNames?: string[]
  passphrases?: Passphrase[]
  passphraseSources?: Partial<Record<string, PassphraseSource>>
  dryRun?: boolean
} = {}) => {
  const cwd = getCwd()

  if (!checkGitenvsJsonExists()) {
    throw new Error('gitenvs.json not found.')
  }
  if (!(await getIsLatestGitenvsVersion())) {
    throw new Error(
      'Version is not latest. Please run `gitenvs migrate` to migrate to the latest version.',
    )
  }

  const gitenvs = await getGitenvs()
  const stageNames = requestedStageNames?.length
    ? [...new Set(requestedStageNames)]
    : gitenvs.envStages.map((s) => s.name)

  const { passphrasePath, passphraseFile, fromFile, fromEnv } =
    await getPassphraseSources()

  const oldPassphrases: Passphrase[] = []
  for (const stageName of stageNames) {
    const explicit = passphrases.find(
      (p) => p.stageName === stageName,
    )?.passphrase
    const file = fromFile(stageName)
    const env = fromEnv(stageName)
    const source = passphraseSources[stageName]

    let passphrase: string | undefined
    if (explicit) {
      passphrase = explicit
    } else if (source) {
      passphrase = source === 'file' ? file : env
      if (!passphrase) {
        throw new Error(
          source === 'file'
            ? `No passphrase for stage ${stageName} in ${PASSPHRASE_FILE_NAME}.`
            : `${getPassphraseEnvName({ stage: stageName })} is not set.`,
        )
      }
    } else if (file && env && file !== env) {
      throw new Error(
        `The passphrase for stage ${stageName} differs between ${PASSPHRASE_FILE_NAME} and ${getPassphraseEnvName({ stage: stageName })}. Choose which one to use (CLI: --passphrase-source file|env).`,
      )
    } else {
      passphrase = file ?? env
    }

    if (passphrase) oldPassphrases.push({ stageName, passphrase })
  }

  await assertWritable([
    cwd,
    join(cwd, 'gitenvs.json'),
    passphrasePath,
    join(cwd, BACKUP_DIR_NAME),
    join((await getProjectRoot()).projectRoot, '.gitignore'),
  ])

  const result = await rerollStages({
    gitenvs,
    passphrases: oldPassphrases,
    stageNames,
  })

  const passphraseEnvNames = stageNames.map((stage) =>
    getPassphraseEnvName({ stage }),
  )
  const summary = {
    dryRun,
    stages: stageNames,
    reencryptedValues: result.reencryptedValues,
    passphrasePath,
    passphraseEnvNames,
    // env vars take precedence over the passphrase file
    staleEnvNames: passphraseEnvNames.filter((name) => !!process.env[name]),
  }

  if (dryRun) {
    return { ...summary, backupDir: null, newPassphrases: [] as Passphrase[] }
  }

  // backup before overwriting anything
  const backupDir = join(
    cwd,
    BACKUP_DIR_NAME,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`,
  )
  await addBackupDirToGitIgnore()
  await mkdir(backupDir, { recursive: true, mode: 0o700 })
  await writeFile(
    join(backupDir, 'gitenvs.json'),
    await readFile(join(cwd, 'gitenvs.json'), 'utf-8'),
  )
  await writeFile(
    join(backupDir, PASSPHRASE_FILE_NAME),
    JSON.stringify(oldPassphrases, null, 2),
    { encoding: 'utf-8', mode: 0o600 },
  )

  // keep passphrases of stages that were not rerolled
  const newPassphraseFile = [
    ...(passphraseFile ?? []).map(
      (p) => result.passphrases.find((n) => n.stageName === p.stageName) ?? p,
    ),
    ...result.passphrases.filter(
      (n) => !passphraseFile?.some((p) => p.stageName === n.stageName),
    ),
  ]

  try {
    // passphrases first: if writing gitenvs.json fails, the backup still has
    // the old passphrases that match the old gitenvs.json
    await writeFileAtomic(
      passphrasePath,
      JSON.stringify(newPassphraseFile, null, 2),
      backupDir,
    )
    await saveGitenvs(result.gitenvs)
  } catch (error) {
    throw new Error(
      `Reroll failed while writing files: ${error instanceof Error ? error.message : String(error)}. Restore gitenvs.json and ${PASSPHRASE_FILE_NAME} from ${backupDir} before trying again.`,
    )
  }

  return { ...summary, backupDir, newPassphrases: result.passphrases }
}
