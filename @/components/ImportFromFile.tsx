import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { type EnvVar } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { parse } from 'dotenv'
import { readdir, readFile } from 'fs/promises'
import { filter, map } from 'lodash-es'
import { join } from 'path'
import { Fragment } from 'react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { AddFromClipboardDialog } from './AddFromClipboardDialog'

export const ImportFromFile = async ({ fileId }: { fileId: string }) => {
  const gitenvs = await getGitenvs()
  const { projectRoot } = await getProjectRoot()
  const fileNames = filter(await readdir(projectRoot), (fileName) =>
    fileName.includes('.env'),
  )
  return (
    <div className="flex flex-col gap-8">
      Select the file to import:
      <div className="grid grid-cols-4 gap-2">
        {fileNames.map((fileName) => (
          <Fragment key={fileName}>
            <ActionButton
              command={{
                label: `Import ${fileName}`,
                group: 'Next Best Action',
              }}
              action={async () => {
                'use server'

                const content = await readFile(
                  join(projectRoot, fileName),
                  'utf8',
                )

                const parsed = parse(content)
                const envVarsToAdd = map(parsed, (value, key) => {
                  const values = Object.fromEntries(
                    map(gitenvs.envStages, (stage) => [
                      stage.name,
                      { value, encrypted: false, fileIds: [fileId] },
                    ]),
                  )
                  return {
                    id: getNewEnvVarId(),
                    fileIds: [fileId],
                    key,
                    values,
                  }
                }) satisfies EnvVar[]
                return superAction(async () => {
                  streamDialog({
                    title: `Import Env File: ${fileName}`,
                    content: (
                      <AddFromClipboardDialog
                        gitenvs={gitenvs}
                        fileId={fileId}
                        newEnvVars={envVarsToAdd}
                        onClose={async () => {
                          'use server'
                          return superAction(async () => {
                            console.log('close')

                            streamDialog(null)
                          })
                        }}
                      />
                    ),
                  })
                })
              }}
            >
              {fileName}
            </ActionButton>
          </Fragment>
        ))}
        {fileNames.length === 0 && (
          <div className="col-span-4 text-center">No files found</div>
        )}
      </div>
    </div>
  )
}
