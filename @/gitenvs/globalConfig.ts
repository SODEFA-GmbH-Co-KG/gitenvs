import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import XDGAppPaths from 'xdg-app-paths'
import { z } from 'zod'

const dataDir = XDGAppPaths('de.sodefa.gitenvs').data()
const configPath = join(dataDir, 'config.json')

export const GlobalConfig = z.object({
  vercelToken: z.string().optional(),
})

export type GlobalConfig = z.infer<typeof GlobalConfig>

export const getGlobalConfig = async () => {
  await mkdir(dataDir, { recursive: true })
  const configString = await readFile(configPath, 'utf-8').catch((error) => {
    const parsed = z.object({ code: z.string() }).parse(error)
    if (parsed.code === 'ENOENT') {
      return '{}'
    }
    throw error
  })
  const config = JSON.parse(configString)
  return GlobalConfig.parse(config)
}

export const setGlobalConfig = async (config: GlobalConfig) => {
  await mkdir(dataDir, { recursive: true })
  const configString = JSON.stringify(config, null, 2)
  await writeFile(configPath, configString, 'utf-8')
}
