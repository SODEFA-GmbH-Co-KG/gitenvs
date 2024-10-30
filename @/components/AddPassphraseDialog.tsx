import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Passphrase, type EnvStage } from '@/gitenvs/gitenvs.schema'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useSetAtom } from 'jotai'
import { map } from 'lodash-es'
import { useState } from 'react'
import { z } from 'zod'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { KeyShortcut } from './KeyShortcut'
import { Input } from './ui/input'

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
              passphrase: passphrase,
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
                onChange={async (event) => {
                  const value = event.target.value
                  const passphrase = await new Promise<string>((res) => {
                    const pastedPassphrases = z
                      .array(Passphrase)
                      .parse(JSON.parse(value))
                    const passphrase = pastedPassphrases.find(
                      (passphrase) => passphrase.stageName === stage.name,
                    )?.passphrase

                    res(passphrase ?? '')
                  }).catch(() => value)

                  setPassphrase(passphrase)
                }}
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
