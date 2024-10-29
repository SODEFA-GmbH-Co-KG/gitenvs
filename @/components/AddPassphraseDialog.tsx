import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { type EnvStage } from '@/gitenvs/gitenvs.schema'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useState } from 'react'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { KeyShortcut } from './KeyShortcut'

export const AddPassphraseDialog = NiceModal.create(
  ({ stage }: { stage: EnvStage }) => {
    const modal = useModal()
    const [passphrase, setPassphrase] = useState('')
    const setStageEncryptionState = useSetAtom(stageEncryptionStateAtom)

    const closeModal = () => {
      modal.resolve()
      modal.remove()
    }

    const done = () => {
      setStageEncryptionState((prev) => {
        const newState = map(prev, (s) => {
          if (s.stageName === stage.name) {
            return {
              ...s,
              decryptionKey: passphrase,
            }
          }
          return s
        })
        return newState
      })
      closeModal()
    }

    return (
      <Dialog
        open={modal.visible}
        onOpenChange={async (show) => {
          if (!show) {
            closeModal()
          }
        }}
      >
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Add your {stage.name} Passphrase</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <form onSubmit={done}>
            <div className="grid gap-4 py-4">
              <Input
                className="text-security-disc col-span-3"
                type="text"
                autoComplete="off"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" className="flex flex-row gap-2">
                <span>Add</span>
                <KeyShortcut>Enter</KeyShortcut>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  },
)
