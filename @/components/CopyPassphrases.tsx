import { Copy } from 'lucide-react'
import { type RouterOutputs } from '~/utils/api'
import { WithCopyButton } from './WithCopyButton'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export const CopyPassphrases = ({
  passphrases,
  onNext,
}: {
  passphrases: RouterOutputs['gitenvs']['createGitenvsJson']
  onNext: () => void
}) => {
  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1 className="text-2xl text-center">Your secret Passphrases</h1>
      <p>
        These are your secret passphrases. You will need them to decrypt your
        secrets. Save those in a safe place (password manager).
      </p>
      <div className="flex flex-col gap-4">
        {passphrases.passphrases.map((passphrase) => (
          <div key={passphrase.stageName} className="flex flex-col gap-4">
            <Label htmlFor={passphrase.stageName}>{passphrase.stageName}</Label>
            <div className="flex flex-row gap-4">
              <WithCopyButton textToCopy={passphrase.passphrase}>
                <Input
                  id={passphrase.stageName}
                  defaultValue={passphrase.passphrase}
                  type="password"
                  readOnly
                />
              </WithCopyButton>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={async () => {
          await navigator.clipboard.writeText(
            JSON.stringify(passphrases.passphrases, null, 2),
          )
        }}
        variant="outline"
      >
        <Copy className="w-4 h-4" />
        &nbsp; Copy all
      </Button>

      <Button onClick={async () => onNext()}>
        I saved them all - next, please!
      </Button>
    </div>
  )
}
