import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '@/gitenvs/idsGenerator'
import { map } from 'lodash-es'
import dynamic from 'next/dynamic'
import { Fragment } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'
import { superAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { TableEnvKey } from './TableEnvKey'
import { TableEnvVar } from './TableEnvVar'

//dynamic import for passphraseInput component with next/dynamic
// const PassphraseInput = dynamic(
//   () => import('./PassphraseInput').then((mod) => mod.PassphraseInput),
//   {
//     ssr: false,
//   },
// )
const EnvVarsStageHeader = dynamic(
  () => import('./EnvVarsStageHeader').then((mod) => mod.EnvVarsStageHeader),
  {
    ssr: false,
  },
)

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
      <div className="flex max-w-full flex-col gap-2 overflow-hidden rounded-md border p-4">
        {!!gitenvs?.envVars.length ? (
          <div
            className="grid w-full gap-2"
            id="supergrid"
            style={{
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${columns - 1}, minmax(300px, 1fr))`,
            }}
          >
            <div className="flex items-center justify-start p-1">
              Passphrase
            </div>
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
            {gitenvs?.envVars.map((envVar, index) => {
              if (envVar.fileId !== fileId) return null

              return (
                <Fragment key={index}>
                  <TableEnvKey gitenvs={gitenvs} envVar={envVar}>
                    <div className="truncate" title={envVar.key}>
                      {envVar.key}
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
