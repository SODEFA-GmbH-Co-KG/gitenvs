'use client'

import { Button } from '@/components/ui/button'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import { EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import {
  each,
  every,
  filter,
  find,
  flatMap,
  intersection,
  keys,
  map,
} from 'lodash-es'
import { AlertCircle, Lock, Unlock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { saveGitenvs } from '~/lib/gitenvs'
import { envVarsToAddAtom } from './PasteEnvVars'
import { TableEnvVarTag } from './TableEnvVarTag'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Label } from './ui/label'

const AddFromClipboardSchema = z.object({
  envVars: z.array(EnvVar),
})

export type AddFromClipboardSchema = z.infer<typeof AddFromClipboardSchema>

export const AddFromClipboardDialog = ({
  gitenvs,
  fileId,
}: {
  gitenvs: Gitenvs
  fileId: string
}) => {
  const [envVarsConfig, setEnvVarsConfig] = useAtom(envVarsToAddAtom)

  const allStages = useMemo(
    () => gitenvs.envStages.map((stage) => stage.name),
    [gitenvs.envStages],
  )
  const allIds = useMemo(
    () => map(envVarsConfig, (envVar) => envVar.id),
    [envVarsConfig],
  )

  const [activeState, setActiveState] = useState<{
    stages: string[]
    ids: string[]
  }>(() => {
    const stages = allStages
    const ids = allIds
    return { stages, ids }
  })

  // 💡 this useEffect is needed if this dialog is mounted before the envVars are written into the jotai atom
  //
  // useEffect(() => {
  //   console.log('init', { allIds })
  //   setActiveState((prev) => {
  //     return { ...prev, stages: allStages, ids: allIds }
  //   })
  // }, [allIds, allStages])

  const toggleActiveState = ({
    stage,
    id,
  }: {
    stage?: string
    id?: string
  }) => {
    //toggle active state for one stage
    if (stage && !id) {
      setActiveState((prev) => {
        const stages = prev.stages.includes(stage)
          ? prev.stages.filter((s) => s !== stage)
          : [...prev.stages, stage]
        return { ...prev, stages }
      })
    }
    //toggle active state for one env id
    if (id && !stage) {
      setActiveState((prev) => {
        const ids = prev.ids.includes(id)
          ? prev.ids.filter((i) => i !== id)
          : [...prev.ids, id]
        return { ...prev, ids }
      })
    }
  }

  const [encryptionState, setEncryptionState] = useState<
    { id: string; stage: string }[]
  >([])

  const toggleEncryptionState = ({
    id,
    stages,
  }: {
    id?: string
    stages?: string[]
  }) => {
    //toggle encryption for all stages for one env id
    if (id && !stages) {
      setEncryptionState((prev) => {
        const allStagesForIdEncrypted = allStages.every((stage) =>
          prev.find((state) => state.id === id && state.stage === stage),
        )
        return allStagesForIdEncrypted
          ? prev.filter((state) => state.id !== id)
          : [...prev, ...map(allStages, (s) => ({ id, stage: s }))]
      })
    }

    //toggle encryption for all ids in one stage
    if (stages && !id) {
      setEncryptionState((prev) => {
        const allIdsInStagesEncrypted = every(allIds, (id) =>
          every(stages, (stage) => {
            return encryptionState.some(
              (es) => es.id === id && es.stage === stage,
            )
          }),
        )
        return allIdsInStagesEncrypted
          ? prev.filter((state) => !stages.includes(state.stage))
          : [
              ...prev,
              ...flatMap(allIds, (i) =>
                map(stages, (stage) => ({ id: i, stage })),
              ),
            ]
      })
    }

    //toggle encryption for one env id in one stage
    if (!!id && !!stages) {
      setEncryptionState((prev) => {
        const exists = prev.find(
          (state) => state.id === id && stages.includes(state.stage),
        )
        return exists
          ? prev.filter(
              (state) => state.id !== id || !stages.includes(state.stage),
            )
          : [...prev, ...map(stages, (stage) => ({ id, stage }))]
      })
    }
  }

  const handleSubmit = async () => {
    if (!envVarsConfig) return

    //filter for ids that are deactivated
    let envVarsToSave = filter(envVarsConfig, (envVar) => {
      return activeState.ids.includes(envVar.id)
    })

    envVarsToSave = await Promise.all(
      map(envVarsToSave, async (envVar) => {
        const values = Object.fromEntries(
          //only map active stages
          await Promise.all(
            map(activeState.stages, async (stage) => {
              const encrypted = !!encryptionState.find(
                (es) => es.id === envVar.id && es.stage === stage,
              )

              let value = envVar.values[stage]!.value

              if (encrypted) {
                const stagePublicKey = gitenvs.envStages.find(
                  (s) => s.name === stage,
                )?.publicKey
                if (!stagePublicKey) {
                  throw new Error(`public key not found for ${stage}`)
                }
                value = await encryptEnvVar({
                  plaintext: value,
                  publicKey: stagePublicKey,
                })
              }

              return [
                stage,
                {
                  value,
                  encrypted,
                },
              ]
            }),
          ),
        )

        return {
          ...envVar,
          values,
        } satisfies EnvVar
      }),
    )
    // Merge values for existing keys, new values have priority over existing
    const keysMerged = map(gitenvs.envVars, (envVar) => {
      const pastedEnvVarForExistingKey = find(envVarsToSave, (pastedEnvVar) => {
        return (
          pastedEnvVar.key === envVar.key &&
          pastedEnvVar.fileId === envVar.fileId
        )
      })
      if (!pastedEnvVarForExistingKey) {
        return envVar
      }
      return {
        ...envVar,
        values: {
          ...envVar.values,
          ...pastedEnvVarForExistingKey.values,
        },
      }
    })
    // filter new env vars that are already merged with existing keys
    const newEnvVars = filter(envVarsToSave, (pastedEnvVar) => {
      return !find(gitenvs.envVars, (envVar) => {
        return (
          envVar.key === pastedEnvVar.key &&
          pastedEnvVar.fileId === envVar.fileId
        )
      })
    })

    // combine existing keys with merged keys and new keys
    const newGitenvs = {
      ...gitenvs,
      envVars: [...keysMerged, ...newEnvVars],
    }

    await saveGitenvs(newGitenvs)
    setEnvVarsConfig(undefined)
  }

  const allKeysAllStagesEncrypted = every(allIds, (id) =>
    every(allStages, (stage) => {
      return encryptionState.some((es) => es.id === id && es.stage === stage)
    }),
  )

  return (
    <Dialog
      open={!!envVarsConfig}
      onOpenChange={(open) => {
        if (!open) {
          setEnvVarsConfig(undefined)
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-[90vw] flex-col">
        <DialogHeader>
          <DialogTitle>Add new Env vars</DialogTitle>
        </DialogHeader>
        <Table className="table-fixed  ">
          <TableHeader
            className="sticky top-0 z-10 bg-background shadow-primary"
            style={{ boxShadow: 'inset 0 -2px 0 0 var(--tw-shadow-color)' }}
          >
            <TableRow className="">
              <TableHead className="w-32 truncate">
                <div className="relative flex items-center">
                  Key
                  <div className="absolute -right-3">
                    <Button
                      size={'sm'}
                      variant={allKeysAllStagesEncrypted ? 'ghost' : 'default'}
                      onClick={() => {
                        each(allStages, (stage) => {
                          toggleEncryptionState({ stages: allStages })
                        })
                      }}
                    >
                      {allKeysAllStagesEncrypted ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      &nbsp;All
                    </Button>
                  </div>
                </div>
              </TableHead>
              {map(allStages, (stage) => {
                const stageInactive = !activeState.stages.includes(stage)
                // const everyKeyInStageEncrypted = every(
                //   activeState.ids,
                //   (id) => {
                //     return encryptionState.some(
                //       (es) => es.id === id && es.stage === stage,
                //     )
                //   },
                // )
                return (
                  <TableHead
                    key={stage}
                    className={cn(
                      'w-32 truncate',
                      stageInactive && 'opacity-50',
                    )}
                  >
                    <div className="relative flex items-center gap-2">
                      <Checkbox
                        checked={activeState.stages.some((s) => s === stage)}
                        onCheckedChange={() => {
                          toggleActiveState({ stage: stage })
                        }}
                        id={stage}
                      />
                      <Label htmlFor={stage}>{stage}</Label>
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="h-full w-full overflow-auto">
            {map(envVarsConfig, (envVar) => {
              const isActive = activeState.ids.some((id) => id === envVar.id)
              const everyActiveStageEncrypted = every(
                activeState.stages,
                (stage) => {
                  return encryptionState.some(
                    (es) => es.id === envVar.id && es.stage === stage,
                  )
                },
              )

              const existingKey = gitenvs.envVars.find(
                (existingEnvVar) =>
                  existingEnvVar.key === envVar.key &&
                  existingEnvVar.fileId === fileId,
              )

              const stagesWithKey =
                isActive && !!existingKey
                  ? intersection(keys(existingKey.values), activeState.stages)
                  : null
              return (
                <TableRow
                  key={envVar.id}
                  className={cn('w-full', !isActive && 'opacity-50')}
                >
                  <TableCell className="w-32" title={envVar.key}>
                    <div className="relative flex items-center gap-2 pr-10">
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => {
                          toggleActiveState({ id: envVar.id })
                        }}
                      />
                      <div className="truncate">{envVar.key}</div>
                      {isActive && (
                        <div className="absolute right-1">
                          <Button
                            size={'icon'}
                            variant={
                              !everyActiveStageEncrypted ? 'ghost' : 'default'
                            }
                            onClick={() => {
                              toggleEncryptionState({ id: envVar.id })
                            }}
                          >
                            {!everyActiveStageEncrypted ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {map(allStages, (stage) => {
                    const envVarInCell = envVar.values[stage]
                    if (!envVarInCell) {
                      console.error(
                        `envVarInCell not found for ${stage} in ${envVar.key}`,
                      )
                      return null
                    }
                    const stageInactive = !activeState.stages.includes(stage)
                    const isActive =
                      activeState.ids.includes(envVar.id) &&
                      activeState.stages.includes(stage)
                    const isEncrypted = !!encryptionState.find(
                      (es) => es.id === envVar.id && es.stage === stage,
                    )

                    const hasConflicts =
                      !!stagesWithKey?.length &&
                      stagesWithKey.includes(stage) &&
                      !!existingKey?.values[stage]?.value &&
                      existingKey?.values[stage]?.value !== envVarInCell.value
                    return (
                      <TableCell
                        key={`${stage}${envVar.id}`}
                        className={cn('w-32', stageInactive && 'opacity-50')}
                        title={envVarInCell?.value ?? 'Empty'}
                      >
                        <div className="relative flex items-center gap-2 pr-10">
                          {hasConflicts && (
                            <div title="Conflict with existing">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                          <div className="flex-1 truncate">
                            <TableEnvVarTag
                              envVarValue={{
                                value: isActive ? envVarInCell.value : '',
                                encrypted: isEncrypted,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button
            variant={'outline'}
            onClick={() => setEnvVarsConfig(undefined)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
