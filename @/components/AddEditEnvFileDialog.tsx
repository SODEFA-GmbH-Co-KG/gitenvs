'use client'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EnvFile, EnvFileType, type Gitenvs } from '@/gitenvs/gitenvs.schema'
import { getNewEnvFileId } from '@/gitenvs/idsGenerator'
import { map } from 'lodash-es'
import { useRouter } from 'next/navigation'
import { saveGitenvs } from '~/lib/gitenvs'
import { useShowDialog } from '~/super-action/dialog/DialogProvider'
import { ActionForm } from '~/super-action/form/ActionForm'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { toast } from './ui/use-toast'

const formNames = {
  filePath: 'filePath',
  name: 'name',
  type: 'type',
}

export const AddEditEnvFileDialog = ({
  gitenvs,
  envFile,
}: {
  gitenvs: Gitenvs
  envFile?: EnvFile
}) => {
  const showDialog = useShowDialog()
  const router = useRouter()

  return (
    <ActionForm
      action={async (formData) => {
        // This code runs on the client side intentionally
        const newEnvFile = EnvFile.parse({
          id: envFile?.id ?? getNewEnvFileId(),
          name: formData?.get(formNames.name),
          filePath: formData?.get(formNames.filePath),
          type: formData?.get(formNames.type),
        })

        const newEnvFiles = envFile?.id
          ? map(gitenvs.envFiles, (file) => {
              if (file.id !== envFile?.id) {
                return file
              }

              return newEnvFile
            })
          : [...gitenvs.envFiles, newEnvFile]

        await saveGitenvs({
          ...gitenvs,
          envFiles: newEnvFiles,
        })

        await showDialog(null)

        toast({
          title: `Env file ${newEnvFile.name} ${envFile?.id ? 'updated' : 'created'}`,
          description: `The env file has been successfully ${envFile?.id ? 'updated' : 'created'}.`,
        })

        router.push(`/file/${newEnvFile.id}`)
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4">
        <Label htmlFor={formNames.filePath}>File Path</Label>
        <Input
          type="text"
          autoComplete="off"
          name={formNames.filePath}
          defaultValue={envFile?.filePath}
        />
      </div>
      <div className="flex flex-row justify-stretch gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <Label htmlFor={formNames.name}>Name</Label>
          <Input
            type="text"
            autoComplete="off"
            name={formNames.name}
            defaultValue={envFile?.name}
          />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <Label htmlFor={formNames.type}>Type</Label>
          <Select name={formNames.type} defaultValue={envFile?.type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EnvFileType.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </ActionForm>
  )
}
