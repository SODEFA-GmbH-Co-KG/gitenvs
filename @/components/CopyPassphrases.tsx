'use client'

import { type Passphrase } from '@/gitenvs/gitenvs.schema'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { map } from 'lodash-es'
import { Save, WholeWord } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'
import { toast } from 'sonner'
import { savePassphrasesToFolder } from '~/lib/gitenvs'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import { encryptWithEncryptionKey } from '~/utils/encryptionToken'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { CopyButton } from './CopyButton'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

const suggestedNamePrefix = '[Gitenvs]'

export const CopyPassphrases = ({ projectName }: { projectName?: string }) => {
  const stageEncryptionState = useAtomValue(stageEncryptionStateAtom)
  const router = useRouter()
  const getEncryptionKeyOnClient = useEncryptionKeyOnClient()

  const passphrases = map(
    stageEncryptionState,
    (passphrase) =>
      ({
        stageName: passphrase.stageName,
        passphrase: passphrase.passphrase ?? '',
      }) satisfies Passphrase,
  )

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Your secret Passphrases</h1>
      <div className="flex flex-col gap-4">
        <p>
          These are your secret passphrases. You will need them to decrypt your
          secrets. Save those in a safe place (password manager).
        </p>
        <p>
          You can also download your{' '}
          <span className="font-bold">development passphrase</span> to your
          project folder. {` `}
          <span className="text-sm">
            This is not recommended for staging or production passphrases! (But
            some people love to live dangerously)
          </span>
        </p>
      </div>
      <div
        className={cn('grid gap-x-2 gap-y-4', {
          'grid-cols-[1fr_auto_auto_auto]': projectName,
          'grid-cols-[1fr_auto_auto]': !projectName,
        })}
      >
        {passphrases.map((passphrase) => (
          <Fragment key={passphrase.stageName}>
            <Label htmlFor={passphrase.stageName} className="col-span-full">
              {passphrase.stageName}
            </Label>
            <Input
              id={passphrase.stageName}
              defaultValue={passphrase.passphrase}
              type="password"
              readOnly
            />
            {projectName && (
              <CopyButton
                icon={<WholeWord className="size-4" />}
                textToCopy={`${suggestedNamePrefix} ${projectName} ${passphrase.stageName}`}
                tooltip="Copy suggested name for password manager"
              />
            )}
            <CopyButton textToCopy={JSON.stringify([passphrase], null, 2)} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const encryptionKey = await getEncryptionKeyOnClient()
                      if (!encryptionKey) return

                      const encryptedPassphrase = {
                        passphrase: await encryptWithEncryptionKey({
                          plaintext: passphrase.passphrase,
                          key: encryptionKey,
                        }),
                        stageName: passphrase.stageName,
                      }

                      const savePromise = savePassphrasesToFolder({
                        encryptedPassphrases: [encryptedPassphrase],
                      })

                      toast.promise(savePromise, {
                        success: 'Saved passphrase to current folder',
                        error: 'Could not save passphrase to current folder',
                      })
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save to current folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Fragment>
        ))}

        <hr className="col-span-full" />

        <Label className="self-center">For all stages</Label>
        {projectName && (
          <CopyButton
            icon={<WholeWord className="size-4" />}
            textToCopy={`${suggestedNamePrefix} ${projectName} all`}
            tooltip="Copy suggested name for password manager"
          />
        )}
        <CopyButton textToCopy={JSON.stringify(passphrases, null, 2)} />
        <Button
          type="button"
          onClick={async () => {
            const encryptionKey = await getEncryptionKeyOnClient()
            if (!encryptionKey) return

            const encryptedPassphrases = await Promise.all(
              passphrases.map(async (passphrase) => {
                return {
                  passphrase: await encryptWithEncryptionKey({
                    plaintext: passphrase.passphrase,
                    key: encryptionKey,
                  }),
                  stageName: passphrase.stageName,
                }
              }),
            )
            const savePromise = savePassphrasesToFolder({
              encryptedPassphrases,
            })

            toast.promise(savePromise, {
              success: 'Saved all passphrases to current folder',
              error: 'Could not save passphrases to current folder',
            })
          }}
          variant="outline"
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
      <Button type="button" onClick={() => router.push('/setup/deploy')}>
        All done - next, please!
      </Button>
    </div>
  )
}
