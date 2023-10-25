'use client'

import { useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { EnvFile, EnvFileType, EnvStage } from '~/gitenvs/gitenvs.schema'
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

export const SetupGitenvs = () => {
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
    <div>
      <h1 className="text-2xl mb-12 text-center">Setup Gitenvs</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            console.log(data)
          })}
        >
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="text-lg">Env File</h2>
              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="envFile.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
            </div>

            <div className="w-[1px] bg-gray-200"></div>

            <div className="flex flex-col gap-4 flex-1">
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
                    🗑️
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
        </form>
      </Form>
    </div>
  )
}
