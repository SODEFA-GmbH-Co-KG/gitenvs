import { parse as parseEnvFile } from 'envfile'
import { readFile } from 'fs/promises'

export const loadDotEnvFile = async (filePath: string) => {
  const file = await readFile(filePath, 'utf8')
  const parsed = parseEnvFile(file)
  return parsed
}
