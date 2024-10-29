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
      modal.resolve()
      modal.remove()
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
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Add your {stage.name} Passphrase</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              className="text-security-disc col-span-3"
              type="text"
              autoComplete="off"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  return done()
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              onClick={async () => {
                done()
              }}
              className="flex flex-row gap-2"
            >
              <span>Add</span>
              <KeyShortcut>Enter</KeyShortcut>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
)
