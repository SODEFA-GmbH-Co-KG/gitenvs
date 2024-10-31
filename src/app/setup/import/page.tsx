import { ImportFromFile } from '@/components/ImportFromFile'
import { Button } from '@/components/ui/button'
import { getGitenvs } from '@/gitenvs/gitenvs'
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams: { fileId?: string }
}) {
  const gitenvs = await getGitenvs()
  const firstFileId = gitenvs.envFiles[0]!.id
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <ImportFromFile fileId={searchParams.fileId ?? firstFileId} />
      </div>

      <Button asChild>
        <Link href="/">Done</Link>
      </Button>
    </div>
  )
}
