import { AddFromClipboardDialog } from '@/components/AddFromClipboardDialog'
import { EnvFileSwitcher } from '@/components/EnvFileSwitcher'
import { PasteEnvVars } from '@/components/PasteEnvVars'
import { Table } from '@/components/Table'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { parse } from 'dotenv'
import { redirect } from 'next/navigation'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'

export default async function Page({ params }: { params: { fileId: string } }) {
  const gitenvs = await getGitenvs()

  if (!gitenvs.envFiles.find((file) => file.id === params.fileId)) {
    redirect(`/`)
  }

  return (
    <div className="flex flex-col gap-2">
      <EnvFileSwitcher gitenvs={gitenvs} activeFileId={params.fileId} />
      <PasteEnvVars
        action={async ({ clipboardText }) => {
          'use server'

          const result = parse(clipboardText)
          const hasResults = Object.keys(result).length > 0
          if (!hasResults) return
          return superAction(async () => {
            streamDialog({
              title: 'Add new env vars',
              content: (
                <AddFromClipboardDialog
                  envVars={result}
                  fileId={params.fileId}
                />
              ),
            })
          })
        }}
      />
      <Table fileId={params.fileId} gitenvs={gitenvs} />
    </div>
  )
}
