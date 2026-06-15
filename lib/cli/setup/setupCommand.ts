import { createKeys } from '@/gitenvs/createKeys'
import { getCwd } from '@/gitenvs/getCwd'
import { getNewEnvFileId } from '@/gitenvs/idsGenerator'
import { getIsGitenvsInGitIgnore, updateGitIgnore } from '@/gitenvs/gitignore'
import { checkGitenvsJsonExists, saveGitenvs } from '@/gitenvs/gitenvs'
import {
  EnvFileType,
  type Gitenvs,
  type Passphrase,
} from '@/gitenvs/gitenvs.schema'
import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getIsGitenvsInstalled, installGitenvs } from '@/gitenvs/installGitenvs'
import { addToScripts, getIsAddedToScripts } from '@/gitenvs/packageJsonScripts'
import {
  getIsPostInstallScriptExisting,
  updatePostInstall,
} from '@/gitenvs/postinstall'
import { existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

export const setupCommandSchema = z.object({
  stages: z.string().default('development,staging,production'),
  file: z.string().min(1).default('.env'),
  fileName: z.string().optional(),
  fileType: EnvFileType.default('dotenv'),
  force: z.boolean().default(false),
  gitignore: z.boolean().default(true),
  install: z.boolean().default(true),
  postinstall: z.boolean().default(true),
  scripts: z.boolean().default(true),
  yes: z.boolean().default(false),
})

const exitWithError = (message: string): never => {
  console.error(`❌ Gitenvs: ${message}`)
  process.exit(1)
}

const parseStageNames = (stages: string) => {
  const stageNames = stages
    .split(',')
    .map((stage) => stage.trim())
    .filter(Boolean)

  if (stageNames.length === 0) {
    exitWithError('At least one stage is required.')
  }

  const uniqueStageNames = new Set(stageNames)
  if (uniqueStageNames.size !== stageNames.length) {
    exitWithError('Stage names must be unique.')
  }

  return stageNames
}

const createInitialGitenvs = async ({
  stageNames,
  file,
  fileName,
  fileType,
}: {
  stageNames: string[]
  file: string
  fileName?: string
  fileType: z.infer<typeof EnvFileType>
}) => {
  const stages = await Promise.all(
    stageNames.map(async (stageName) => {
      const keys = await createKeys()
      return {
        name: stageName,
        ...keys,
      }
    }),
  )

  const gitenvs = {
    version: '2',
    envStages: stages.map(({ passphrase: _passphrase, ...stage }) => stage),
    envFiles: [
      {
        id: getNewEnvFileId(),
        name: fileName ?? file,
        filePath: file,
        type: fileType,
      },
    ],
    envVars: [],
  } satisfies Gitenvs

  const passphrases = stages.map((stage) => ({
    stageName: stage.name,
    passphrase: stage.passphrase,
  })) satisfies Passphrase[]

  await saveGitenvs(gitenvs)
  await writeFile(
    join(getCwd(), PASSPHRASE_FILE_NAME),
    JSON.stringify(passphrases, null, 2),
    'utf-8',
  )

  console.log('✅ Gitenvs: Created gitenvs.json')
  console.log(`✅ Gitenvs: Created ${PASSPHRASE_FILE_NAME}`)
}

export const setupCommand = async (
  options: z.infer<typeof setupCommandSchema>,
) => {
  const stageNames = parseStageNames(options.stages)
  const passphrasePath = join(getCwd(), PASSPHRASE_FILE_NAME)
  const gitenvsExists = checkGitenvsJsonExists()

  if (!gitenvsExists || options.force) {
    if (existsSync(passphrasePath) && !options.force && !gitenvsExists) {
      exitWithError(
        `${PASSPHRASE_FILE_NAME} already exists. Pass --force to overwrite it.`,
      )
    }

    await createInitialGitenvs({
      stageNames,
      file: options.file,
      fileName: options.fileName,
      fileType: options.fileType,
    })
  } else {
    console.log('✅ Gitenvs: gitenvs.json already exists, keeping it')
  }

  if (options.gitignore) {
    if (!(await getIsGitenvsInGitIgnore())) {
      await updateGitIgnore()
      console.log(`✅ Gitenvs: Added ${PASSPHRASE_FILE_NAME} to .gitignore`)
    } else {
      console.log(`✅ Gitenvs: ${PASSPHRASE_FILE_NAME} is already ignored`)
    }
  }

  const { foundPackageJson } = await getProjectRoot()
  if (!foundPackageJson) {
    if (options.install || options.postinstall || options.scripts) {
      console.log('⚠️ Gitenvs: No package.json found, skipped package setup')
    }
    return
  }

  if (options.install) {
    if (!(await getIsGitenvsInstalled())) {
      await installGitenvs()
      console.log('✅ Gitenvs: Installed gitenvs as a dev dependency')
    } else {
      console.log('✅ Gitenvs: gitenvs is already installed')
    }
  }

  if (options.postinstall) {
    if (!(await getIsPostInstallScriptExisting())) {
      await updatePostInstall()
      console.log('✅ Gitenvs: Added postinstall script')
    } else {
      console.log('✅ Gitenvs: postinstall already runs gitenvs create')
    }
  }

  if (options.scripts) {
    if (!(await getIsAddedToScripts())) {
      await addToScripts()
      console.log('✅ Gitenvs: Added package script')
    } else {
      console.log('✅ Gitenvs: package script already exists')
    }
  }
}
