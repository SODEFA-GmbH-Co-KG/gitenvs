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
        <ImportFromVercel
          fileId={searchParams.fileId ?? firstFileId}
          teamId={searchParams.teamId}
          projectId={searchParams.projectId}
        />
      </div>
      <Hr />
      <Button asChild variant={'default'}>
        <Link href="/">Setup Done</Link>
      </Button>
    </div>
  )
}
