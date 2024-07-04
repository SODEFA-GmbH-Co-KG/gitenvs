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
import { type EnvVar, type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { api } from '~/utils/api'

export const EditEnvKeyDialog = NiceModal.create(
  ({ envVar, gitenvs }: { envVar: EnvVar; gitenvs: Gitenvs }) => {
    const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()
    const utils = api.useUtils()
    const modal = useModal()
    const [key, setKey] = useState('')

    const done = () => {
      modal.resolve()
      modal.remove()
    }

    const updateKey = async () => {
      const newEnVars = gitenvs.envVars.map((v) => {
        if (v.id !== envVar.id) return v

        return {
          ...v,
          key,
        }
      })

      await saveGitenvs({
        gitenvs: {
          ...gitenvs,
          envVars: newEnVars,
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
              await updateKey()
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Env Key</DialogTitle>
              {/* <DialogDescription>
            Make changes to your profile here.
          </DialogDescription> */}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                className="col-span-3"
                type="text"
                autoComplete="off"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                onKeyDown={async (event) => {
                  if (event.key === 'Enter') {
                    return updateKey()
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button type="button">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  },
)