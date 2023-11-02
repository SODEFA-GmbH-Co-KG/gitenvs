import { Copy, Save } from 'lucide-react'
import { type RouterOutputs } from '~/utils/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

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
        {passphrases.passphrases.map((passphrase) => (
          <div key={passphrase.stageName} className="flex flex-col gap-4">
            <Label htmlFor={passphrase.stageName}>{passphrase.stageName}</Label>
            <div className="flex flex-row gap-2">
              <Input
                id={passphrase.stageName}
                defaultValue={passphrase.passphrase}
                type="password"
                readOnly
              />
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(passphrase.passphrase)
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO:
                      }}
                    >
                      <Save className="w-4 h-4" />
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
        <Button
          onClick={async () => {
            // TODO:
          }}
          variant="outline"
        >
          <Save className="w-4 h-4" />
          &nbsp; Save all to current folder
        </Button>
        <Button onClick={async () => onNext()}>All done - next, please!</Button>
      </div>
    </div>
  )
}
