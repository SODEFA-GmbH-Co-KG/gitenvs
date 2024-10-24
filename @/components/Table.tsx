import { Input } from '@/components/ui/input'
import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'
import { superAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { TableEnvKey } from './TableEnvKey'
import { TableEnvVar } from './TableEnvVar'

export const Table = ({
  fileId,
  gitenvs,
}: {
  fileId: string
  gitenvs: Gitenvs
}) => {
  const columns = (gitenvs?.envStages.length ?? 0) + 1

  return (
    <Fragment>
      <div className="flex flex-col gap-2 rounded-md border p-4">
        {!!gitenvs?.envVars.length ? (
          <div
            className="grid gap-2"
            id="supergrid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            <div></div>
            {gitenvs?.envStages.map((stage) => (
              <div key={stage.name} className="flex flex-col gap-2">
                {stage.name}
              </div>
            ))}
            <div className="p-1">Passphrase</div>
            {gitenvs?.envStages.map((stage) => (
              <Input
                key={stage.name}
                className="flex flex-col gap-2"
                autoComplete="new-password"
                type="password"
              ></Input>
            ))}
            <div className="p-1">Key</div>
            {gitenvs?.envStages.map((stage) => (
              <div key={stage.name} className="flex flex-col gap-2">
                {stage.name}
              </div>
            ))}
            {gitenvs?.envVars.map((envVar, index) => {
              if (envVar.fileId !== fileId) return null

              return (
                <Fragment key={index}>
                  <TableEnvKey gitenvs={gitenvs} envVar={envVar}>
                    <div>{envVar.key}</div>
                  </TableEnvKey>

                  {gitenvs?.envStages.map((stage) => {
                    return (
                      <TableEnvVar
                        key={`${envVar.key}-${stage.name}`}
                        gitenvs={gitenvs}
                        envVar={envVar}
                        envStage={stage}
                      />
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        ) : (
          <p>No env vars so far. Add a new one</p>
        )}
        <ActionButton
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
                  { id: getNewEnvVarId(), fileId, key: '', values },
                ],
              }
              await saveGitenvs(newGitenvs)
            })
          }}
        >
          Add
        </ActionButton>
      </div>
    </Fragment>
  )
}
