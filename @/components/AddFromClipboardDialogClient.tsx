'use client'

import { Button } from '@/components/ui/button'
import { EnvVar, Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { every, find, map } from 'lodash-es'
import { Lock, Unlock } from 'lucide-react'
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

// const [useStagesForm] = createZodForm(AddFromClipboardSchema)

export const AddFromClipboardDialogClient = ({
  formAction,
  gitenvs,
}: {
  formAction: SuperActionWithInput<AddFromClipboardSchema>
  gitenvs: Gitenvs
}) => {
  const setEnvVarsConfig = useSetAtom(envVarsToAddAtom)
  const envVarsConfig = useAtomValue(envVarsToAddAtom)

  const stages = gitenvs.envStages
  // const [stages, setStages] = useState(map(gitenvs.envStages, (stage) => ({stage, active: true})))
  // const [envVarsConfig, setEnvVarsConfig] = useState(
  //   map(envVars, (envVar) => ({
  //     ...envVar,
  //     values: map(envVar.values, (value, key) => ({
  //       stage: key,
  //       value,
  //       active: true,
  //     })),
  //   })),
  // )

  const setEnvVarActiveState = ({
    id,
    active,
    encrypted,
  }: {
    id: string
  } & (
    | { active?: undefined; encrypted: boolean }
    | { active: boolean; encrypted?: undefined }
  )) => {
    console.log({ id, active })

    setEnvVarsConfig((prev) =>
      prev?.map((envVar) => {
        if (envVar.id === id) {
          if (encrypted !== undefined) {
            return {
              ...envVar,
              values: map(envVar.values, (value) => ({ ...value, encrypted })),
            }
          }
          if (active !== undefined) {
            return {
              ...envVar,
              values: map(envVar.values, (value) => ({ ...value, active })),
            }
          }
        }
        return envVar
      }),
    )
  }

  const setStageActiveState = ({
    name,
    active,
    encrypted,
  }: {
    name: string
  } & (
    | { active?: undefined; encrypted: boolean }
    | { active: boolean; encrypted?: undefined }
  )) => {
    setEnvVarsConfig((prev) =>
      prev?.map((envVar) => {
        return {
          ...envVar,
          values: map(envVar.values, (value) => {
            if (value.stage === name) {
              if (encrypted !== undefined) {
                return { ...value, encrypted }
              }
              if (active !== undefined) {
                return { ...value, active }
              }
            }
            return value
          }),
        }
      }),
    )
  }

  const getStageActiveState = ({ name }: { name: string }) => {
    const active = every(envVarsConfig, (envVar) => {
      return envVar.values.find((value) => value.stage === name)?.active
    })
      ? true
      : every(envVarsConfig, (envVar) => {
            return !envVar.values.find((value) => value.stage === name)?.active
          })
        ? false
        : ('indeterminate' as const)

    const encrypted = every(envVarsConfig, (envVar) => {
      return envVar.values.find((value) => value.stage === name)?.encrypted
    })
    return {
      active,
      encrypted,
    }
  }

  const getEnvVarActiveState = ({ id }: { id: string }) => {
    const envVarToCheck = envVarsConfig?.find((envVar) => envVar.id === id)
    const active = every(envVarToCheck?.values, ({ active }) => active === true)
      ? true
      : every(envVarToCheck?.values, ({ active }) => active === false)
        ? false
        : ('indeterminate' as const)
    const encrypted = every(
      envVarToCheck?.values,
      ({ encrypted }) => encrypted === true,
    )
    return {
      active,
      encrypted,
    }
  }

  const { trigger, isLoading } = useSuperAction({
    action: formAction,
    catchToast: true,
  })

  const disabled = isLoading

  // const form = useStagesForm({
  //   defaultValues: {
  //     stages: stages.map((stage) => stage.name),
  //     envVars: map(envVars, (_, key) => key),
  //     encrypted: false,
  //   },
  // })

  // const activatedStages = form.watch('stages')

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
          {/* <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                await trigger(data)
              })}
              className="flex h-full w-full flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="stages"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-xl">Stages</FormLabel>
                      <FormDescription>
                        Select the stages to add the new environment variables
                        to.
                      </FormDescription>
                    </div>
                    {stages.map((stage) => (
                      <FormField
                        key={stage.name}
                        control={form.control}
                        name="stages"
                        render={({ field }) => {
                          return (
                            <>
                              <FormItem
                                key={stage.name}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(stage.name)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            stage.name,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== stage.name,
                                            ),
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {stage.name}
                                </FormLabel>
                              </FormItem>
                            </>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="">
                <FormLabel className="text-xl">Encrypt</FormLabel>
              </div>
              <FormField
                control={form.control}
                name="encrypted"
                render={({ field }) => {
                  return (
                    <>
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Save Encrypted
                        </FormLabel>
                      </FormItem>
                    </>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="envVars"
                render={() => (
                  <FormItem className="flex min-h-0 w-full flex-1 flex-col">
                    <div className="mb-4">
                      <FormLabel className="text-xl">Env Vars</FormLabel>
                      <FormDescription>
                        New environment variables to add.
                      </FormDescription>
                    </div>
                    <div className="flex h-full flex-col gap-2 overflow-auto">
                      {map(envVars, (envVar, key) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name="envVars"
                          render={({ field }) => {
                            const keyExists = gitenvs.envVars.find(
                              (envVar) => envVar.key === key,
                            )

                            const stagesWithKey = !!keyExists
                              ? intersection(
                                  keys(keyExists.values),
                                  activatedStages,
                                )
                              : null
                            const hasConflicts =
                              !!stagesWithKey && !!stagesWithKey.length

                            return (
                              <div className="pr-8">
                                <FormItem
                                  key={key}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(key)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              key,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== key,
                                              ),
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel
                                    className={cn('flex w-full flex-col')}
                                  >
                                    <div className="break-words">
                                      <span className="text-[rgb(168,216,248)]">
                                        {key}
                                      </span>
                                      =
                                      <span className="text-[rgb(191,143,120)]">
                                        {envVar}
                                      </span>
                                    </div>

                                    {!!hasConflicts && (
                                      <div className="flex gap-1 text-yellow-500">
                                        Conflict:{' '}
                                        {map(stagesWithKey, (stage) => (
                                          <div key={stage}>{stage}</div>
                                        ))}
                                      </div>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              </div>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form> */}

          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 truncate">Key</TableHead>
                {map(stages, (stage) => {
                  const stageState = getStageActiveState({ name: stage.name })
                  return (
                    <TableHead key={stage.name} className="w-32 truncate">
                      <div className="group relative flex items-center gap-2">
                        <Checkbox
                          checked={
                            getStageActiveState({ name: stage.name }).active
                          }
                          onCheckedChange={(value) => {
                            if (value === 'indeterminate') {
                              console.error('indeterminate state not supported')
                              return
                            }
                            setStageActiveState({
                              name: stage.name,
                              active: value,
                            })
                          }}
                        />
                        {stage.name}
                        <div className="absolute right-0 hidden group-hover:block">
                          <Button
                            size={'icon'}
                            variant={'ghost'}
                            onClick={() => {
                              setStageActiveState({
                                name: stage.name,
                                encrypted: !stageState.encrypted,
                              })
                            }}
                          >
                            {stageState.encrypted ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody className="w-full truncate">
              {map(envVarsConfig, (envVar) => {
                const allDeactivated = every(
                  envVar.values,
                  ({ active }) => !active,
                )
                const envVarState = getEnvVarActiveState({ id: envVar.id })
                return (
                  <TableRow
                    key={envVar.id}
                    className={cn('w-full', allDeactivated && 'opacity-50')}
                  >
                    <TableCell className="w-32" title={envVar.key}>
                      <div className="group relative flex items-center gap-2 pr-10">
                        <Checkbox
                          checked={envVarState.active}
                          onCheckedChange={(value) => {
                            if (value === 'indeterminate') {
                              console.error('indeterminate state not supported')
                              return
                            }
                            setEnvVarActiveState({
                              id: envVar.id,
                              active: value,
                            })
                          }}
                        />
                        <div className="truncate">{envVar.key}</div>
                        <div className="absolute right-0 hidden group-hover:block">
                          <Button
                            size={'icon'}
                            variant={'ghost'}
                            onClick={() => {
                              setEnvVarActiveState({
                                id: envVar.id,
                                encrypted: !envVarState.encrypted,
                              })
                            }}
                          >
                            {envVarState.encrypted ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    {map(stages, (stage) => {
                      const envVarInCell = find(
                        envVar.values,
                        (ev) => ev.stage === stage.name,
                      )
                      if (!envVarInCell) {
                        console.error(
                          `envVarInCell not found for ${stage.name} in ${envVar.key}`,
                        )
                        return null
                      }
                      return (
                        <TableCell
                          key={`${stage.name}${envVar.id}`}
                          className="w-32"
                          title={envVarInCell?.value ?? 'Empty'}
                        >
                          <div className="group relative flex items-center gap-2 pr-10">
                            <div className="truncate">
                              <TableEnvVarTag
                                envVarValue={{
                                  value: envVarInCell.active
                                    ? envVarInCell.value
                                    : '',
                                  encrypted: envVarInCell?.encrypted ?? false,
                                }}
                              />
                            </div>
                            {envVarInCell.active && (
                              <div className="absolute right-0 hidden group-hover:block">
                                <Button size={'icon'} variant={'ghost'}>
                                  <Lock className="h-4 w-4" />
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
          <Button type="submit" disabled={disabled}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
