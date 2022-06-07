import { readFile } from 'fs/promises'

export const loadTsEnvFile = async (filePath: string) => {
  const file = await readFile(filePath, 'utf8')
  return file
}
