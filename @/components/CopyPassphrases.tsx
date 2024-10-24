'use client'

import { passphrasesAtom } from '@/passphrasesAtom'
import { useAtom } from 'jotai'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { savePassphraseToFolder } from '~/lib/gitenvs'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import { encryptWithEncryptionToken } from '~/utils/encryptionToken'
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

export const CopyPassphrases = () => {
  const [passphrases] = useAtom(passphrasesAtom)
  const router = useRouter()
  const getEncryptionKeyOnClient = useEncryptionKeyOnClient()

  return (
    <div className="flex max-w-lg flex-col gap-8">
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
      <div className="flex flex-col gap-4">
        {passphrases.map((passphrase) => (
          <div key={passphrase.stageName} className="flex flex-col gap-4">
            <Label htmlFor={passphrase.stageName}>{passphrase.stageName}</Label>
            <div className="flex flex-row gap-2">
              <Input
                id={passphrase.stageName}
                defaultValue={passphrase.passphrase}
                type="password"
                readOnly
              />
              <CopyButton textToCopy={passphrase.passphrase} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const save = async () => {
                          const encryptedPassphrase =
                            await encryptWithEncryptionToken({
                              plaintext: passphrase.passphrase,
                              key: await getEncryptionKeyOnClient(),
                            })
                          await savePassphraseToFolder({
                            encryptedPassphrase,
                            stageName: passphrase.stageName,
                          })
                        }

                        toast.promise(save(), {
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
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <CopyButton
          textToCopy={JSON.stringify(passphrases, null, 2)}
          additionalText="Copy all"
        />
        <Button
          type="button"
          onClick={async () => {
            const promise = Promise.all(
              passphrases.map(async (passphrase) => {
                const encryptedPassphrase = await encryptWithEncryptionToken({
                  plaintext: passphrase.passphrase,
                  key: await getEncryptionKeyOnClient(),
                })

                return savePassphraseToFolder({
                  encryptedPassphrase,
                  stageName: passphrase.stageName,
                })
              }),
            )

            toast.promise(promise, {
              success: 'Saved all passphrases to current folder',
              error: 'Could not save passphrases to current folder',
            })
          }}
          variant="outline"
        >
          <Save className="h-4 w-4" />
          &nbsp; Save all to current folder
        </Button>
        <Button type="button" onClick={() => router.push('/setup/deploy')}>
          All done - next, please!
        </Button>
      </div>
    </div>
  )
}
