import { Hr } from '@/components/Hr'
import { ImportFromFile } from '@/components/ImportFromFile'
import { ImportFromVercel } from '@/components/ImportFromVercel'
import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { Button } from '@/components/ui/button'
import { getVercelProject } from '@/components/vercel/getVercelProject'
import { TokenInput } from '@/components/vercel/VercelTokenInput'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { getGlobalConfig } from '@/gitenvs/globalConfig'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Page({
  searchParams,
}: {
  searchParams: { fileId?: string; teamId?: string; projectId?: string }
}) {
  const gitenvs = await getGitenvs()
  const firstFileId = gitenvs.envFiles[0]!.id
  const globalConfig = await getGlobalConfig()

  const { teamId, projectId, fileId } = searchParams

  if (!teamId && !projectId) {
    const vercelProject = await getVercelProject()
    if (vercelProject) {
      redirect(
        `/setup/import?fileId=${fileId ?? firstFileId}&teamId=${vercelProject.orgId}&projectId=${vercelProject.projectId}`,
      )
    }
  }
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Import your env variables</h1>
      Select your import target file:
      <SimpleParamSelect
        label="File"
        component="dropdown"
        paramKey="fileId"
        options={gitenvs.envFiles.map((file) => ({
          value: file.id,
          label: file.name,
        }))}
      />
      <Hr />
      <h1 className="text-center text-xl">Import from your files</h1>
      <div className="flex flex-col gap-4">
        <ImportFromFile fileId={searchParams.fileId ?? firstFileId} />
      </div>
      <Hr />
      <h1 className="text-center text-xl">Import from Vercel</h1>
      <div className="flex flex-col gap-4">
        {globalConfig.vercelToken ? (
          <ImportFromVercel
            fileId={searchParams.fileId ?? firstFileId}
            teamId={teamId}
            projectId={projectId}
          />
        ) : (
          <TokenInput />
        )}
      </div>
      <Hr />
      <Button asChild variant={'default'}>
        <Link href={`/file/${searchParams.fileId ?? firstFileId}`}>
          Setup Done
        </Link>
      </Button>
    </div>
  )
}
