import { GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { getCwd } from '@/gitenvs/getCwd'
import { getIsGitenvsExisting } from '@/gitenvs/getIsGitenvsExisting'
import { getPassphrase, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getGitenvs, getIsLatestGitenvsVersion } from '@/gitenvs/gitenvs'
import { spawn, type ChildProcess, type SpawnOptions } from 'child_process'
import { constants as osConstants } from 'os'
import { join } from 'path'
import { z } from 'zod'
import { resolveEnvVars } from '../resolveEnvVars'

export const runCommandSchema = z.object({
  file: z.string().optional(),
  stage: z.string().default('development'),
  passphrase: z.string().optional(),
  passphrasePath: z.string().optional(),
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
})

export type RunCommandOptions = z.infer<typeof runCommandSchema>

export type RunCommandResult = {
  code: number
  signal?: NodeJS.Signals
}

type SpawnProcess = (
  command: string,
  args: readonly string[],
  options: SpawnOptions,
) => ChildProcess

export const buildRunEnvironment = async (options: RunCommandOptions) => {
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
    stage,
    passphrase: options.passphrase,
    passphrasePath: options.passphrasePath,
  })

  if (!passphrase) {
    console.error(
      `Requested passphrase for stage ${stage} not found in ${
        options.passphrasePath ?? join(getCwd(), PASSPHRASE_FILE_NAME)
      }`,
    )
    process.exit(1)
  }

  const resolvedEnvVars = await resolveEnvVars({
    gitenvs,
    envFile: resolveRunEnvFile({
      file: options.file,
      envFiles: gitenvs.envFiles,
    }),
    envStage,
    passphrase,
  })

  return {
    ...process.env,
    ...Object.fromEntries(
      resolvedEnvVars.map((envVar) => [envVar.key, envVar.value]),
    ),
  }
}

export const runCommand = async (
  options: RunCommandOptions,
  spawnProcess: SpawnProcess = spawn,
): Promise<RunCommandResult> => {
  const env = await buildRunEnvironment(options)
  const child = spawnProcess(options.command, options.args, {
    stdio: 'inherit',
    env,
  })

  return waitForChildProcess({
    child,
    command: options.command,
  })
}

const waitForChildProcess = async ({
  child,
  command,
}: {
  child: ChildProcess
  command: string
}): Promise<RunCommandResult> => {
  const forwardedSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP']
  const signalListeners = forwardedSignals.map((signal) => ({
    signal,
    listener: () => {
      if (!child.killed) {
        child.kill(signal)
      }
    },
  }))

  signalListeners.forEach(({ signal, listener }) => {
    process.once(signal, listener)
  })

  const cleanup = () => {
    signalListeners.forEach(({ signal, listener }) => {
      process.off(signal, listener)
    })
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: RunCommandResult) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    child.once('error', (error: NodeJS.ErrnoException) => {
      console.error(
        `❌ Gitenvs: Failed to start "${command}": ${error.message}`,
      )
      finish({ code: error.code === 'ENOENT' ? 127 : 1 })
    })

    child.once('exit', (code, signal) => {
      if (typeof code === 'number') {
        finish({ code })
        return
      }

      if (signal) {
        finish({ code: getSignalExitCode(signal), signal })
        return
      }

      finish({ code: 1 })
    })
  })
}

const resolveRunEnvFile = ({
  file,
  envFiles,
}: {
  file?: string
  envFiles: Awaited<ReturnType<typeof getGitenvs>>['envFiles']
}) => {
  if (file) {
    const envFile = envFiles.find((envFile) => envFile.filePath === file)
    if (!envFile) {
      console.error(
        `❌ Gitenvs: Env file ${file} not found. Available: ${formatAvailableEnvFiles(envFiles)}`,
      )
      process.exit(1)
    }

    return envFile
  }

  if (envFiles.length === 1) {
    return envFiles[0]
  }

  console.error(
    `❌ Gitenvs: Multiple env files are configured. Pass --file <filePath>. Available: ${formatAvailableEnvFiles(envFiles)}`,
  )
  process.exit(1)
}

const formatAvailableEnvFiles = (
  envFiles: Awaited<ReturnType<typeof getGitenvs>>['envFiles'],
) => envFiles.map((envFile) => envFile.filePath).join(', ') || '(none)'

const getSignalExitCode = (signal: NodeJS.Signals) => {
  const signalNumber = osConstants.signals[signal]
  return signalNumber ? 128 + signalNumber : 1
}
