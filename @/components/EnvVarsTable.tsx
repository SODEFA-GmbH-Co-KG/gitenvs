import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { map, orderBy } from 'lodash-es'
import { AlertTriangle, ArrowDownAZ, Link } from 'lucide-react'
import { Fragment } from 'react'
import { AddNewEnvVar } from './AddNewEnvVar'
import { EnvVarsStageHeader } from './EnvVarsStageHeader'
import { SimpleParamButton } from './simple/SimpleParamButton'
import { SimpleParamInput } from './simple/SimpleParamInput'
import { TableEnvKey } from './TableEnvKey'
import { TableEnvVar } from './TableEnvVar'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const EnvVarsTable = async ({
  fileId,
  gitenvs,
  query,
  sortAsc,
}: {
  fileId: string
  gitenvs: Gitenvs
  query?: string
  sortAsc?: boolean
}) => {
  const columns = (gitenvs?.envStages.length ?? 0) + 1

  const envVarsInFile = gitenvs?.envVars.filter(
    (envVar) =>
      envVar.fileIds.includes(fileId) && envVar.key.includes(query ?? ''),
  )

  const sortedEnvVars = sortAsc
    ? orderBy(envVarsInFile, (e) => e.key)
    : envVarsInFile

  return (
    <Fragment>
      <div className="flex max-w-full flex-col gap-2 overflow-auto rounded-md border p-4">
        <div
          className="grid w-full gap-2"
          id="supergrid"
          style={{
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${columns - 1}, minmax(300px, 1fr))`,
          }}
        >
          <div className="flex items-center justify-start gap-2 p-1">
            <SimpleParamInput paramKey="query" placeholder="Search Keys..." />
            <SimpleParamButton
              variant={sortAsc ? 'default' : 'outline'}
              className="border"
              paramKey={'sortAsc'}
            >
              <ArrowDownAZ className="h-4 w-4" />
            </SimpleParamButton>
          </div>
          {gitenvs?.envStages.map((stage) => {
            return (
              <div className="flex items-center gap-2" key={stage.name}>
                <EnvVarsStageHeader stage={stage} />
              </div>
            )
          })}
          <div className="col-span-4 my-2">
            <hr />
          </div>

          <AddNewEnvVar fileId={fileId} gitenvs={gitenvs} />
          {map(sortedEnvVars, (envVar) => {
            const keyDuplicatesExist =
              envVarsInFile.filter((ev) => ev.key === envVar.key).length > 1
            const isMultiFileEnvVar = envVar.fileIds.length > 1
            return (
              <Fragment key={envVar.id}>
                <TableEnvKey gitenvs={gitenvs} envVar={envVar} fileId={fileId}>
                  <div className="flex w-full items-center justify-between gap-1">
                    <div className="truncate" title={envVar.key}>
                      {envVar.key}
                    </div>
                    <div className="flex gap-1">
                      {isMultiFileEnvVar && (
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
                      {keyDuplicatesExist && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>
                            This key exists multiple times in the file
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
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
      </div>
    </Fragment>
  )
}
