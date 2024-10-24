'use client'

import { Button } from '@/components/ui/button'
import { EnvVar, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { filter, intersection, keys, map } from 'lodash-es'
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
import { type SuperActionWithInput } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'
import { envVarsToAddAtom } from './PasteEnvVars'
import { TableEnvVarTag } from './TableEnvVarTag'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

const AddFromClipboardSchema = z.object({
  envVars: z.array(EnvVar),
})

export type AddFromClipboardSchema = z.infer<typeof AddFromClipboardSchema>

export const AddFromClipboardDialogClient = ({
  formAction,
  gitenvs,
}: {
  formAction: SuperActionWithInput<AddFromClipboardSchema>
  gitenvs: Gitenvs
}) => {
  const setEnvVarsConfig = useSetAtom(envVarsToAddAtom)
  const envVarsConfig = useAtomValue(envVarsToAddAtom)

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
    stage,
  }: {
    id?: string
    stage?: string
  }) => {
    //toggle encryption for all stages for one env id
    if (id && !stage) {
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
    if (stage && !id) {
      setEncryptionState((prev) => {
        const allIdsInStageEncrypted = allIds.every((id) =>
          prev.find((state) => state.id === id && state.stage === stage),
        )
        return allIdsInStageEncrypted
          ? prev.filter((state) => state.stage !== stage)
          : [...prev, ...map(allIds, (i) => ({ id: i, stage }))]
      })
    }

    //toggle encryption for one env id in one stage
    if (!!id && !!stage) {
      setEncryptionState((prev) => {
        const exists = prev.find(
          (state) => state.id === id && state.stage === stage,
        )
        return exists
          ? prev.filter((state) => state.id !== id || state.stage !== stage)
          : [...prev, { id, stage }]
      })
    }
  }

  const { trigger, isLoading } = useSuperAction({
    action: formAction,
    catchToast: true,
  })

  const disabled = isLoading

  const handleSubmit = async () => {
    if (!envVarsConfig) return

    //filter for ids that are deactivated
    let envVarsToSave = filter(envVarsConfig, (envVar) => {
      return activeState.ids.includes(envVar.id)
    })

    envVarsToSave = map(envVarsToSave, (envVar) => {
      const values = Object.fromEntries(
        //only map active stages
        map(activeState.stages, (stage) => [
          stage,
          {
            value: envVar.values[stage]!.value,
            encrypted: !!encryptionState.find(
              (es) => es.id === envVar.id && es.stage === stage,
            ),
          },
        ]),
      )

      return {
        ...envVar,
        values,
      } satisfies EnvVar
    })

    await trigger({ envVars: envVarsToSave })
    setEnvVarsConfig(undefined)
  }

  return (
    <Dialog
      open={!!envVarsConfig}
      onOpenChange={(open) => {
        if (!open) {
          setEnvVarsConfig(undefined)
        }
      }}
    >
      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Add new Env vars</DialogTitle>
        </DialogHeader>
        <div className="h-full max-h-screen w-full overflow-hidden p-1 md:max-h-[80vh]">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 truncate">Key</TableHead>
                {map(allStages, (stage) => {
                  const stageInactive = !activeState.stages.includes(stage)
                  const stageEncrypted = encryptionState.some(
                    (es) => es.stage === stage,
                  )
                  return (
                    <TableHead
                      key={stage}
                      className={cn(
                        'w-32 truncate',
                        stageInactive && 'opacity-50',
                      )}
                    >
                      <div className="group relative flex items-center gap-2">
                        <Checkbox
                          checked={activeState.stages.some((s) => s === stage)}
                          onCheckedChange={() => {
                            toggleActiveState({ stage: stage })
                          }}
                        />
                        {stage}
                        {!stageInactive && (
                          <div className="absolute right-0 hidden group-hover:block">
                            <Button
                              size={'icon'}
                              variant={stageEncrypted ? 'ghost' : 'default'}
                              onClick={() => {
                                toggleEncryptionState({ stage: stage })
                              }}
                            >
                              {encryptionState.some(
                                (es) => es.stage === stage,
                              ) ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody className="w-full truncate">
              {map(envVarsConfig, (envVar) => {
                const isActive = activeState.ids.some((id) => id === envVar.id)
                const isEncrypted = encryptionState.some(
                  (es) => es.id === envVar.id,
                )
                return (
                  <TableRow
                    key={envVar.id}
                    className={cn('w-full', !isActive && 'opacity-50')}
                  >
                    <TableCell className="w-32" title={envVar.key}>
                      <div className="group relative flex items-center gap-2 pr-10">
                        <Checkbox
                          checked={isActive}
                          onCheckedChange={() => {
                            toggleActiveState({ id: envVar.id })
                          }}
                        />
                        <div className="truncate">{envVar.key}</div>
                        {isActive && (
                          <div className="absolute right-0 hidden group-hover:block">
                            <Button
                              size={'icon'}
                              variant={isEncrypted ? 'ghost' : 'default'}
                              onClick={() => {
                                toggleEncryptionState({ id: envVar.id })
                              }}
                            >
                              {encryptionState.some(
                                (es) => es.id === envVar.id,
                              ) ? (
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

                      const keyExists = gitenvs.envVars.find(
                        (existingEnvVar) => existingEnvVar.key === envVar.key,
                      )

                      const stagesWithKey =
                        isActive && !!keyExists
                          ? intersection(
                              keys(keyExists.values),
                              activeState.stages,
                            )
                          : null
                      const hasConflicts =
                        !!stagesWithKey && !!stagesWithKey.length
                      return (
                        <TableCell
                          key={`${stage}${envVar.id}`}
                          className={cn('w-32', stageInactive && 'opacity-50')}
                          title={envVarInCell?.value ?? 'Empty'}
                        >
                          <div className="group relative flex items-center gap-2 pr-10">
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
                            {isActive && (
                              <div className="absolute right-0 hidden group-hover:block">
                                <Button
                                  size={'icon'}
                                  variant={isEncrypted ? 'ghost' : 'default'}
                                  onClick={() => {
                                    toggleEncryptionState({
                                      id: envVar.id,
                                      stage: stage,
                                    })
                                  }}
                                >
                                  {isEncrypted ? (
                                    <Unlock className="h-4 w-4" />
                                  ) : (
                                    <Lock className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button
            variant={'outline'}
            onClick={() => setEnvVarsConfig(undefined)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={disabled} onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
