import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { revalidatePath } from 'next/cache'
import { saveGitenvs } from '~/gitenvs/gitenvs'
import { EnvFile, EnvFileType, type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { getNewEnvFileId } from '~/gitenvs/idsGenerator'
import {
  streamDialog,
  streamToast,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export const NewEnvFileDialog = ({ gitenvs }: { gitenvs: Gitenvs }) => {
  return (
    <div className="sm:max-w-[425px]">
      <ActionForm
        action={async (formData) => {
          'use server'

          return superAction(async () => {
            const newEnvFile = EnvFile.parse({
              id: getNewEnvFileId(),
              name: formData?.get('name'),
              filePath: formData?.get('filePath'),
              type: formData?.get('type'),
            })

            await saveGitenvs({
              ...gitenvs,
              envFiles: [...gitenvs.envFiles, newEnvFile],
            })

            streamDialog(null)
            streamToast({
              title: 'Env file created',
              description: 'The env file has been successfully created.',
            })

            revalidatePath('/', 'layout')
          })
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-4">
          <Label htmlFor="filePath">File Path</Label>
          <Input type="text" autoComplete="off" name="filePath" />
        </div>
        <div className="flex flex-row justify-stretch gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <Label htmlFor="name">Name</Label>
            <Input type="text" autoComplete="off" name="name" />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <Label htmlFor="type">Type</Label>
            <Select name="type">
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
    </div>
  )
}
