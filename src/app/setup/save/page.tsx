import { CopyPassphrases } from '@/components/CopyPassphrases'
import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

const allowedRedirects = ['/']

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect: string }>
}) {
  const { redirect } = await searchParams
  if (!!redirect && !allowedRedirects.includes(redirect)) {
    throw new Error('Invalid redirect')
  }
  const projectName = await getProjectName().catch(() => undefined)
  return <CopyPassphrases projectName={projectName} redirect={redirect} />
}

const getProjectName = async () => {
  const { projectRoot } = await getProjectRoot()
  const packageJson = await readFile(join(projectRoot, 'package.json'), 'utf-8')
  const packageJsonParsed = z
    .object({ name: z.string() })
    .parse(JSON.parse(packageJson))
  return packageJsonParsed.name
}
