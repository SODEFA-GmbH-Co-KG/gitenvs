import { Hr } from '@/components/Hr'
import { ImportFromFile } from '@/components/ImportFromFile'
import { ImportFromVercel } from '@/components/ImportFromVercel'
import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { Button } from '@/components/ui/button'
import { getGitenvs } from '@/gitenvs/gitenvs'
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams: { fileId?: string; teamId?: string; projectId?: string }
}) {
  const gitenvs = await getGitenvs()
  const firstFileId = gitenvs.envFiles[0]!.id
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Import existing .env Files</h1>
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
      <div className="flex flex-col gap-4">
        <ImportFromFile fileId={searchParams.fileId ?? firstFileId} />
      </div>
      <div className="flex flex-col gap-4">
        <ImportFromVercel
          fileId={searchParams.fileId ?? firstFileId}
          teamId={searchParams.teamId}
          projectId={searchParams.projectId}
        />
      </div>
      <Button asChild>
        <Link href="/">Done</Link>
      </Button>
    </div>
  )
}
