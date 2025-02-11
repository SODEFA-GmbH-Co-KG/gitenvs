import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

export const getVercelProject = async () => {
  try {
    const { projectRoot } = await getProjectRoot()
    const vercelProjectJson = join(projectRoot, '.vercel', 'project.json')
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
