import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

export const getVercelProject = async () => {
  try {
    const root = await getProjectRoot()
    const vercelProjectJson = join(root, '.vercel', 'project.json')
    const vercelProject = JSON.parse(await readFile(vercelProjectJson, 'utf-8'))
    const parsed = z
      .object({
        projectId: z.string(),
        orgId: z.string(),
      })
      .parse(vercelProject)
    return parsed
  } catch (error) {
    return null
  }
}
