import { Input } from '@/components/ui/input'
import { Fragment } from 'react'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { EnvKeyMenu } from './EnvKeyMenu'
import { TableEnvKey } from './TableEnvKey'
import { TableEnvVar } from './TableEnvVar'
import { TableKeydownHandler } from './TableKeydownHandler'

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
      <TableKeydownHandler columns={columns} />
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
                    <EnvKeyMenu gitenvs={gitenvs} envVar={envVar} />
                  </TableEnvKey>

                  {gitenvs?.envStages.map((stage) => {
                    return (
                      <TableEnvVar
                        key={`${envVar.key}-${stage.name}`}
                        gitenvs={gitenvs}
                        envVar={envVar}
                        envStage={stage}
                      >
                        {envVar.values[stage.name]?.encrypted ? (
                          <span className="rounded-sm bg-gray-600 p-1 text-xs uppercase">
                            Encrypted
                          </span>
                        ) : (
                          envVar.values[stage.name]?.value
                        )}
                      </TableEnvVar>
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        ) : (
          <p>No env vars so far. Add a new one</p>
        )}
        {/* <Button
          type="button"
          onClick={async () => {
            if (!gitenvs) return
            const values = Object.fromEntries(
              gitenvs.envStages.map((stage) => [
                stage.name,
                { value: '', encrypted: true },
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
          }}
        >
          Add
        </Button> */}
      </div>
    </Fragment>
  )
}
