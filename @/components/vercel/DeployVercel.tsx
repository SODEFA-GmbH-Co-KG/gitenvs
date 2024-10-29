import { getGlobalConfig } from '@/gitenvs/globalConfig'
import { redirect } from 'next/navigation'
import { getVercelProject } from './getVercelProject'
import { VercelDeployer } from './VercelDeployer'
import { TokenInput } from './VercelTokenInput'

export const DeployVercel = async ({
  teamId,
  projectId,
  upsert,
}: {
  teamId?: string
  projectId?: string
  upsert?: boolean
}) => {
  const config = await getGlobalConfig()

  if (!config.vercelToken) {
    return <TokenInput />
  }

  if (!teamId && !projectId) {
    const vercelProject = await getVercelProject()
    if (vercelProject) {
      redirect(
        `/setup/deploy?teamId=${vercelProject.orgId}&projectId=${vercelProject.projectId}`,
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <VercelDeployer
        config={config}
        teamId={teamId}
        projectId={projectId}
        upsert={upsert}
      />
    </div>
  )
}
