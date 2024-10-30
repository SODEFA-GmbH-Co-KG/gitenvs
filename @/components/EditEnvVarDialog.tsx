import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { decryptEnvVar } from '@/gitenvs/decryptEnvVar'
import { encryptEnvVar } from '@/gitenvs/encryptEnvVar'
import {
  type EnvStage,
  type EnvVar,
  type Gitenvs,
} from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useAtomValue } from 'jotai'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { saveGitenvs } from '~/lib/gitenvs'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
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
    const modal = useModal()
    const [plaintext, setPlaintext] = useState('')
    const [show, setShow] = useState(false)

    const stageEncryptionStates = useAtomValue(stageEncryptionStateAtom)

    const stageEncryptionState = stageEncryptionStates?.find(
      (s) => s.stageName === envStage.name,
    )

    const initialEnvVarValue = envVar.values[envStage.name]

    useEffect(() => {
      const decryptValue = async () => {
        const shouldDecrypt =
          initialEnvVarValue?.encrypted &&
          initialEnvVarValue?.value &&
          stageEncryptionState?.passphrase

        if (!shouldDecrypt) {
          setPlaintext(initialEnvVarValue?.value ?? '')
          return
        }

        const decryptedValue = await decryptEnvVar({
          encrypted: initialEnvVarValue.value,
          encryptedPrivateKey: envStage.encryptedPrivateKey,
          passphrase: stageEncryptionState.passphrase ?? '',
        })

        if (decryptedValue) {
          setPlaintext(decryptedValue)
        }
      }

      decryptValue().catch(console.error)
    }, [
      envStage.encryptedPrivateKey,
      initialEnvVarValue?.encrypted,
      initialEnvVarValue?.value,
      stageEncryptionState?.passphrase,
    ])

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
        ...gitenvs,
        envVars: newEnVars,
      })
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
            <DialogDescription />
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-row focus-within:rounded focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
              <Input
                className={cn(
                  'col-span-3 rounded-r-none border-r-0 outline-none focus-within:outline-none focus:outline-none focus:ring-0 focus-visible:ring-0',
                  !show && 'text-security-disc',
                )}
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
              <Button
                className="rounded-l-none"
                variant={'outline'}
                type="button"
                size={'icon'}
                onClick={() => setShow(!show)}
              >
                {show ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </Button>
            </div>
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
