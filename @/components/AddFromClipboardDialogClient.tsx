'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { type DotenvParseOutput } from 'dotenv'
import { intersection, keys, map } from 'lodash-es'
import { z } from 'zod'
import { Checkbox } from '~/components/ui/checkbox'
import { type SuperActionWithInput } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'
import { createZodForm } from '~/utils/useZodForm'

const AddFromClipboardSchema = z.object({
  stages: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
  envVars: z.array(z.string()),
  encrypted: z.boolean(),
})

export type AddFromClipboardSchema = z.infer<typeof AddFromClipboardSchema>

const [useStagesForm] = createZodForm(AddFromClipboardSchema)

export const AddFromClipboardDialogClient = ({
  formAction,
  envVars,
  gitenvs,
}: {
  formAction: SuperActionWithInput<AddFromClipboardSchema>
  envVars: DotenvParseOutput
  gitenvs: Gitenvs
}) => {
  const stages = gitenvs.envStages

  const { trigger, isLoading } = useSuperAction({
    action: formAction,
    catchToast: true,
  })

  const disabled = isLoading

  const form = useStagesForm({
    defaultValues: {
      stages: stages.map((stage) => stage.name),
      envVars: map(envVars, (_, key) => key),
      encrypted: false,
    },
  })

  const activatedStages = form.watch('stages')

  return (
    <div className="h-full max-h-screen w-full overflow-hidden p-1 md:max-h-[80vh]">
      <Form {...form}>
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
                    Select the stages to add the new environment variables to.
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
                <div className="flex h-full flex-col gap-2">
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
                                      ? field.onChange([...field.value, key])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== key,
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className={cn('flex w-full flex-col')}>
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
          <div className="mt-4 flex flex-row justify-end gap-2">
            <Button type="submit" disabled={disabled}>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
