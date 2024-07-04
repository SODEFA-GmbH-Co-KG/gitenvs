'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useState } from 'react'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { getNewEnvVarId } from '~/gitenvs/idsGenerator'
import { api } from '~/utils/api'
import { Label } from './ui/label'

export const NewEnvFileDialog = NiceModal.create(
  ({ gitenvs }: { gitenvs: Gitenvs }) => {
    const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()
    const utils = api.useUtils()
    const modal = useModal()
    const [name, setName] = useState('')
    const [filePath, setFilePath] = useState('')

    const done = () => {
      modal.resolve()
      modal.remove()
    }

    const newEnvFile = async () => {
      await saveGitenvs({
        gitenvs: {
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
        },
      })

      await utils.gitenvs.invalidate()

      done()
    }

    return (
      <Dialog
        open={modal.visible}
        onOpenChange={async (show) => {
          if (!show) {
            done()
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              await newEnvFile()
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>New Env File</DialogTitle>
              {/* <DialogDescription>
            Make changes to your profile here.
          </DialogDescription> */}
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                autoComplete="off"
                value={name}
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
              <Label htmlFor="filePath">File Path</Label>
              <Input
                type="text"
                autoComplete="off"
                value={filePath}
                name="filePath"
                onChange={(event) => setFilePath(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  },
)
