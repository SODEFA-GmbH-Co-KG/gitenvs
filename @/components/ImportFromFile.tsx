import { getGitenvs } from '@/gitenvs/gitenvs'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { parse } from 'dotenv'
import { readdir, readFile } from 'fs/promises'
import { map } from 'lodash-es'
import { join } from 'path'
import { Fragment } from 'react'
import {
  streamDialog,
  superAction,
  SuperAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { AddFromClipboardDialogClient } from './AddFromClipboardDialogClient'

export const ImportFromFile = async ({
  onNext,
}: {
  onNext: SuperAction<null, void>
}) => {
  const fileNames = await readdir(process.cwd())
  const gitenvs = await getGitenvs()
  const file = gitenvs.envFiles[0]
  const fileId = file?.id ?? 'unknown'
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">
        Import Files into //TODO: FILESWITCHER {file?.name}
      </h1>

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
                      { value, encrypted: false },
                    ]),
                  )
                  return { id: getNewEnvVarId(), fileId, key, values }
                })
                return superAction(async () => {
                  streamDialog({
                    title: `Import Env File: ${fileName}`,
                    content: (
                      <AddFromClipboardDialogClient
                        gitenvs={gitenvs}
                        fileId={fileId}
                        envVarsToAdd={envVarsToAdd}
                        onClose={async () => {
                          'use server'
                          return superAction(async () => {
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
      </div>

      <ActionButton action={onNext}>Next</ActionButton>
    </div>
  )
}
