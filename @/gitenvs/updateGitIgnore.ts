import { readFile, writeFile } from 'fs/promises'

export const updateGitIgnore = async () => {
  const currentIgnore = await readFile(`${process.cwd()}/.gitignore`, 'utf-8')

  if (currentIgnore.includes('*.gitenvs.passphrase')) {
    return
  }

  await writeFile(
    `${process.cwd()}/.gitignore`,
    `${currentIgnore}\n\n#gitenvs\n*.gitenvs.passphrase`,
  )
}
