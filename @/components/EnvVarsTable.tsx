import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { Link } from 'lucide-react'
import { Fragment } from 'react'
import { AddNewEnvVar } from './AddNewEnvVar'
import { EnvVarsStageHeader } from './EnvVarsStageHeader'
import { TableEnvKey } from './TableEnvKey'
import { TableEnvVar } from './TableEnvVar'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const EnvVarsTable = async ({
  fileId,
  gitenvs,
}: {
  fileId: string
  gitenvs: Gitenvs
}) => {
  const columns = (gitenvs?.envStages.length ?? 0) + 1

  return (
    <Fragment>
      <div className="flex max-w-full flex-col gap-2 overflow-auto rounded-md border p-4">
        {!!gitenvs?.envVars.length ? (
          <div
            className="grid w-full gap-2"
            id="supergrid"
            style={{
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${columns - 1}, minmax(300px, 1fr))`,
            }}
          >
            <div className="flex items-center justify-start p-1"></div>
            {gitenvs?.envStages.map((stage) => {
              return (
                <div className="flex items-center gap-2" key={stage.name}>
                  <EnvVarsStageHeader stage={stage} />
                </div>
              )
            })}
            <div className="col-span-4 my-4">
              <hr />
            </div>
            <AddNewEnvVar fileId={fileId} gitenvs={gitenvs} />
            {gitenvs?.envVars.map((envVar, index) => {
              if (!envVar.fileIds.includes(fileId)) return null

              return (
                <Fragment key={index}>
                  <TableEnvKey
                    gitenvs={gitenvs}
                    envVar={envVar}
                    fileId={fileId}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="truncate" title={envVar.key}>
                        {envVar.key}
                      </div>
                      {envVar.fileIds.length > 1 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link className="h-4 w-4 shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>
                            This env var is used in the following files:
                            {envVar.fileIds.map((fileId) => {
                              const file = gitenvs.envFiles.find(
                                (file) => file.id === fileId,
                              )
                              return <div key={fileId}>{file?.name}</div>
                            })}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableEnvKey>

                  {gitenvs?.envStages.map((stage) => {
                    return (
                      <div
                        key={`${envVar.key}-${stage.name}`}
                        className="min-w-0"
                      >
                        <TableEnvVar
                          gitenvs={gitenvs}
                          envVar={envVar}
                          envStage={stage}
                        />
                      </div>
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        ) : (
          <p>No env vars so far. Add a new one</p>
        )}
      </div>
      <div className="flex w-full flex-col gap-2 md:flex-row">
        {/* <ActionButton
          className="flex-1"
          command={{
            shortcut: {
              key: 'a',
            },
            label: 'Add new env var',
          }}
          action={async () => {
            'use server'

            return superAction(async () => {
              const values = Object.fromEntries(
                map(gitenvs.envStages, (stage) => [
                  stage.name,
                  { value: '', encrypted: false },
                ]),
              )
              const newGitenvs = {
                ...gitenvs,
                envVars: [
                  ...gitenvs.envVars,
                  { id: getNewEnvVarId(), fileIds: [fileId], key: '', values },
                ],
              }
              await saveGitenvs(newGitenvs)
            })
          }}
        >
          <Plus className="mr-2 h-4 w-4 shrink-0" /> Add new env var
        </ActionButton> */}
        {/* <ActionButton
          className="flex-1"
          command={{
            shortcut: {
              key: 'a',
            },
            label: 'Add new env var',
          }}
          action={async () => {
            'use server'

            return superAction(async () => {
              streamDialog({
                title: `Link existing env var`,
                content: <LinkEnvVarDialog gitenvs={gitenvs} fileId={fileId} />,
              })
            })
          }}
        >
          <Link className="mr-2 h-4 w-4 shrink-0" /> Link existing env var
        </ActionButton> */}
      </div>
    </Fragment>
  )
}
