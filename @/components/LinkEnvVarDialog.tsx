'use client'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { map } from 'lodash-es'
import { CircleAlert, File, Link } from 'lucide-react'
import { useState } from 'react'
import { type SuperAction } from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const LinkEnvVarDialog = ({
  gitenvs,
  fileId,
  saveAction,
}: {
  gitenvs: Gitenvs
  fileId: string
  saveAction: SuperAction<void, FormData>
}) => {
  const [search, setSearch] = useState('')

  return (
    <div className="py-2">
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search EnvVar Name"
      />
      <ActionForm action={saveAction} className="flex w-[60vw] flex-col gap-4">
        <div className="max-h-[60vh] overflow-y-auto">
          <Accordion type="single" collapsible>
            {map(
              gitenvs.envFiles.filter((file) => file.id !== fileId),
              (file) => {
                const envVars = gitenvs.envVars.filter(
                  (ev) =>
                    ev.fileIds.includes(file.id) &&
                    !ev.fileIds.includes(fileId),
                )
                const filteredEnvVars = search
                  ? envVars.filter((ev) =>
                      ev.key.toLowerCase().includes(search.toLowerCase()),
                    )
                  : envVars
                const hasEnvVars = filteredEnvVars.length > 0
                return (
                  <AccordionItem value={file.id} key={file.id}>
                    <AccordionTrigger className="m-2 p-2">
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          !hasEnvVars && 'text-muted-foreground opacity-50',
                          hasEnvVars && 'font-bold text-foreground',
                        )}
                      >
                        <File className="size-4" /> {file.name} (
                        {filteredEnvVars.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="mt-1 flex flex-col gap-4 pl-8">
                      {!envVars.length && (
                        <div className="italic">File Empty</div>
                      )}
                      {map(filteredEnvVars, (ev) => {
                        const isMultiFileEnvVar = ev.fileIds.length > 1
                        return (
                          <div key={ev.id} className="flex gap-2">
                            <Checkbox id={ev.id} value={ev.id} name={ev.id} />
                            <Label
                              htmlFor={ev.id}
                              className="flex items-center gap-2"
                            >
                              {ev.key}{' '}
                              {isMultiFileEnvVar && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link className="h-4 w-4 shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    This env var is used in the following files:
                                    {ev.fileIds.map((fileId) => {
                                      const file = gitenvs.envFiles.find(
                                        (file) => file.id === fileId,
                                      )
                                      return (
                                        <div key={fileId}>{file?.name}</div>
                                      )
                                    })}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </Label>
                          </div>
                        )
                      })}
                    </AccordionContent>
                  </AccordionItem>
                )
              },
            )}
          </Accordion>
          {gitenvs.envFiles.length === 1 && (
            <Alert>
              <CircleAlert className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                To link an env var to this file, you have to create an env var
                in another file first.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {gitenvs.envFiles.length > 1 && (
          <DialogFooter>
            <Button type="submit" className="my-2">
              Add to File
            </Button>
          </DialogFooter>
        )}
      </ActionForm>
    </div>
  )
}
