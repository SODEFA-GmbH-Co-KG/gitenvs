import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { saveGitenvs } from '~/gitenvs/gitenvs'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '~/gitenvs/idsGenerator'
import {
  streamDialog,
  streamToast,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'
import { Label } from './ui/label'

export const NewEnvFileDialog = ({ gitenvs }: { gitenvs: Gitenvs }) => {
  // const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()
  // const utils = api.useUtils()
  // const modal = useModal()
  // const [name, setName] = useState('')
  // const [filePath, setFilePath] = useState('')

  // const done = () => {
  //   modal.resolve()
  //   modal.remove()
  // }

  // const newEnvFile = async () => {
  //   await saveGitenvs({
  //     gitenvs: {
  //       ...gitenvs,
  //       envFiles: [
  //         ...gitenvs.envFiles,
  //         {
  //           id: getNewEnvVarId(),
  //           name,
  //           filePath,
  //           // TODO: Set type
  //           type: 'dotenv',
  //         },
  //       ],
  //     },
  //   })

  //   await utils.gitenvs.invalidate()

  //   done()
  // }

  return (
    <div className="sm:max-w-[425px]">
      <ActionForm
        action={async (formData) => {
          'use server'

          return superAction(async () => {
            const name = z.string().parse(formData?.get('name'))
            const filePath = z.string().parse(formData?.get('filePath'))

            await saveGitenvs({
              ...gitenvs,
              envFiles: [
                ...gitenvs.envFiles,
                {
                  id: getNewEnvVarId(),
                  name,
                  filePath,
                  // TODO: Set type
                  type: 'dotenv',
                },
              ],
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
          <Label htmlFor="name">Name</Label>
          <Input type="text" autoComplete="off" name="name" />
          <Label htmlFor="filePath">File Path</Label>
          <Input type="text" autoComplete="off" name="filePath" />
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </ActionForm>
    </div>
  )
}
