import { getGitenvs } from '@/gitenvs/gitenvs'
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
import { Hr } from './Hr'
import { SimpleParamSelect } from './simple/SimpleParamSelect'

export const ImportFromFile = async ({ fileId }: { fileId: string }) => {
  const gitenvs = await getGitenvs()
  const fileNames = filter(await readdir(process.cwd()), (fileName) =>
    fileName.includes('.env'),
  )
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
                  join(process.cwd(), fileName),
                  'utf8',
                )

                const parsed = parse(content)
                const envVarsToAdd = map(parsed, (value, key) => {
                  const values = Object.fromEntries(
                    map(gitenvs.envStages, (stage) => [
                      stage.name,
                      { value, encrypted: false, fileId },
                    ]),
                  )
                  return { id: getNewEnvVarId(), fileId, key, values }
                })
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
      {/* <ActionButton action={onNext}>Next</ActionButton> */}
    </div>
  )
}
