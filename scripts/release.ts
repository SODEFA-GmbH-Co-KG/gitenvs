import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PACKAGE_JSON_URL = new URL('../package.json', import.meta.url)
const PACKAGE_JSON_PATH = fileURLToPath(PACKAGE_JSON_URL)
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/

type PackageJson = {
  version?: string
}

const runGit = (args: string[]) => {
  return execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  }).trim()
}

const gitCommandSucceeds = (args: string[]) => {
  try {
    execFileSync('git', args, {
      cwd: REPO_ROOT,
      stdio: 'ignore',
    })

    return true
  } catch {
    return false
  }
}

const getSuggestedVersion = (currentVersion: string) => {
  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)/)

  if (!match) {
    throw new Error(
      `Current version "${currentVersion}" is not a supported semver value.`,
    )
  }

  const [, major, minor, patch] = match

  return `${major}.${minor}.${Number.parseInt(patch, 10) + 1}`
}

const promptVersion = async (
  currentVersion: string,
  suggestedVersion: string,
) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log(`Current version: ${currentVersion}`)
  console.log(`Press Enter to use: ${suggestedVersion}`)

  try {
    const answer = await rl.question('Release version: ')
    return answer.trim() || suggestedVersion
  } finally {
    rl.close()
  }
}

const ensureReleaseIsPossible = (version: string) => {
  if (!SEMVER_PATTERN.test(version)) {
    throw new Error(
      `Version "${version}" is invalid. Expected a semver value like 2.1.15 or 2.1.15-next.0.`,
    )
  }

  const tagName = `v${version}`

  if (gitCommandSucceeds(['rev-parse', '--verify', '--quiet', `refs/tags/${tagName}`])) {
    throw new Error(`Tag "${tagName}" already exists locally.`)
  }

  if (
    runGit(['ls-remote', '--tags', 'origin', `refs/tags/${tagName}`]).length > 0
  ) {
    throw new Error(`Tag "${tagName}" already exists on origin.`)
  }

  if (
    runGit(['status', '--short', '--', 'package.json']).length > 0
  ) {
    throw new Error('package.json already has local changes. Commit or discard them first.')
  }

  const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'])

  if (currentBranch === 'HEAD') {
    throw new Error('Cannot create a release from a detached HEAD.')
  }
}

const updatePackageVersion = async (version: string) => {
  const packageJson = JSON.parse(
    await readFile(PACKAGE_JSON_PATH, 'utf8'),
  ) as PackageJson

  packageJson.version = version

  await writeFile(PACKAGE_JSON_PATH, `${JSON.stringify(packageJson, null, 2)}\n`)
}

const main = async () => {
  const packageJson = JSON.parse(
    await readFile(PACKAGE_JSON_PATH, 'utf8'),
  ) as PackageJson

  if (!packageJson.version) {
    throw new Error('package.json does not contain a version field.')
  }

  const versionFromCli = process.argv[2]?.trim()
  const suggestedVersion = getSuggestedVersion(packageJson.version)
  const nextVersion =
    versionFromCli || (await promptVersion(packageJson.version, suggestedVersion))

  if (nextVersion === packageJson.version) {
    throw new Error(`Version is already ${nextVersion}. Choose a different release version.`)
  }

  ensureReleaseIsPossible(nextVersion)
  await updatePackageVersion(nextVersion)

  const tagName = `v${nextVersion}`

  console.log(`Updated package.json to ${nextVersion}.`)

  runGit(['commit', '-m', `chore(release): ${tagName}`, '--', 'package.json'])
  console.log(`Created release commit for ${tagName}.`)

  runGit(['tag', '-a', tagName, '-m', tagName])
  console.log(`Created tag ${tagName}.`)

  runGit(['push', 'origin', 'HEAD'])
  runGit(['push', 'origin', tagName])

  console.log(`Pushed commit and tag ${tagName} to origin.`)
}

try {
  await main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
}
