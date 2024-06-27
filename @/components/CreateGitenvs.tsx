'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { createKeys } from '~/gitenvs/createKeys'
import {
  EnvFile,
  EnvFileType,
  EnvStage,
  type Passphrase,
} from '~/gitenvs/gitenvs.schema'
import { api } from '~/utils/api'
import { useZodForm } from '~/utils/useZodForm'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export const CreateGitenvs = ({
  onPassphrases,
}: {
  onPassphrases: (passphrases: Passphrase[]) => void
}) => {
  const { mutateAsync, isLoading: creatingGitenvsIsLoading } =
    api.gitenvs.createGitenvs.useMutation()
  const [isGenerating, setIsGenerating] = useState(false)

  const isLoading = creatingGitenvsIsLoading || isGenerating

  const form = useZodForm({
    schema: z.object({
      envFile: EnvFile.omit({ id: true }),
      envStages: z.array(
        EnvStage.omit({ publicKey: true, encryptedPrivateKey: true }),
      ),
    }),
    defaultValues: {
      envFile: {
        name: '.env',
        type: 'dotenv',
        filePath: './.env',
      },
      envStages: [
        { name: 'development' },
        { name: 'staging' },
        { name: 'production' },
      ],
    },
  })

  const envStages = useFieldArray({
    name: 'envStages',
    control: form.control,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          setIsGenerating(true)
          try {
            const stages = await Promise.all(
              data.envStages.map(async (stage) => {
                const keys = await createKeys()

                return {
                  name: stage.name,
                  ...keys,
                }
              }),
            )

            await mutateAsync({
              version: '1',
              envStages: stages.map(({ passphrase: _, ...stage }) => stage), // IMPORTANT: Don't save the passphrase to gitenvs.json
              envFiles: [
                {
                  ...data.envFile,
                  id: globalThis.crypto.randomUUID(),
                },
              ],
              envVars: [],
            })

            const passphrases = stages.map((stage) => ({
              stageName: stage.name,
              passphrase: stage.passphrase,
            }))

            onPassphrases(passphrases)
          } finally {
            setIsGenerating(false)
          }
        })}
        className="flex flex-col gap-8"
      >
        <h1 className="text-center text-2xl">Setup Gitenvs</h1>
        <div className="flex flex-row gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <h2 className="text-lg">Env File</h2>
            <div>
              <FormField
                control={form.control}
                name="envFile.filePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Path</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-row gap-4">
              <FormField
                control={form.control}
                name="envFile.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormField
                  control={form.control}
                  name="envFile.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EnvFileType.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="w-[1px] bg-gray-200"></div>

          <div className="flex flex-1 flex-col gap-4">
            <h2 className="text-lg">Stages</h2>
            <FormLabel>Name</FormLabel>
            {envStages.fields.map((field, index) => (
              <div className="flex flex-row gap-4" key={field.id}>
                <FormField
                  control={form.control}
                  name={`envStages.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => envStages.remove(index)}
                  disabled={envStages.fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => envStages.append({ name: '' })}
              variant="outline"
            >
              Add Stage
            </Button>
          </div>
        </div>

        <Button type="submit" variant="default" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Let&apos;s go
        </Button>
      </form>
    </Form>
  )
}
