import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useState } from 'react'
import { encryptEnvVar } from '~/gitenvs/encryptEnvVar'
import {
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '~/gitenvs/gitenvs.schema'
import { api } from '~/utils/api'
import { KeyShortcut } from './KeyShortcut'

export const EditEnvVarDialog = NiceModal.create(
  ({
    envVar,
    envStage,
    gitenvs,
  }: {
    envVar: EnvVar
    envStage: EnvStage
    gitenvs: Gitenvs
  }) => {
    const { mutateAsync: saveGitenvs } = api.gitenvs.saveGitenvs.useMutation()
    const utils = api.useUtils()
    const modal = useModal()
    const [plaintext, setPlaintext] = useState('')

    const done = () => {
      modal.resolve()
      modal.remove()
    }

    const update = async ({
      value,
      encrypted,
    }: {
      value: string
      encrypted: boolean
    }) => {
      const newEnVars = gitenvs.envVars.map((v) => {
        if (v.id !== envVar.id) return v

        return {
          ...v,
          values: {
            ...v.values,
            [envStage.name]: {
              value: value,
              encrypted,
            },
          },
        }
      })

      await saveGitenvs({
        gitenvs: {
          ...gitenvs,
          envVars: newEnVars,
        },
      })

      await utils.gitenvs.invalidate()
    }

    const savePlain = async () => {
      await update({ value: plaintext, encrypted: false })
      done()
    }

    const saveEncrypted = async () => {
      const encrypted = await encryptEnvVar({
        plaintext,
        publicKey: envStage.publicKey,
      })
      await update({ value: encrypted, encrypted: true })
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
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Edit Env Var</DialogTitle>
            {/* <DialogDescription>
            Make changes to your profile here.
          </DialogDescription> */}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              className="text-security-disc col-span-3"
              type="text"
              autoComplete="off"
              value={plaintext}
              onChange={(event) => setPlaintext(event.target.value)}
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  if (event.shiftKey) {
                    return savePlain()
                  }
                  return saveEncrypted()
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              variant={'outline'}
              type="button"
              onClick={async () => {
                await savePlain()
              }}
              className="flex flex-row gap-2"
            >
              <span>Save plain</span>
              <div className="flex flex-row gap-1">
                <KeyShortcut>Shift</KeyShortcut>
                <KeyShortcut>Enter</KeyShortcut>
              </div>
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await saveEncrypted()
              }}
              className="flex flex-row gap-2"
            >
              <span>Save encrypted</span>
              <KeyShortcut>Enter</KeyShortcut>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
)
