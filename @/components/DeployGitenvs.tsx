import { type RouterOutputs } from '~/utils/api'
import { WithCopyButton } from './WithCopyButton'
import { Button } from './ui/button'
import { Input } from './ui/input'

export const DeployGitenvs = ({
  passphrases,
  onNext,
}: {
  passphrases: RouterOutputs['gitenvs']['createGitenvsJson']
  onNext: () => void
}) => {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl text-center">Setup your hosting provider</h1>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl">Easy deployment via CLI</h2>
        <p className="text-sm ml-4">
          We can deploy the environment variables to these providers
          automatically.
        </p>
        <Button variant="outline" className="self-center">
          🚀 Deploy to Vercel
        </Button>
      </div>

      <div className="flex flex-row gap-4 items-center">
        <div className="h-[1px] w-full bg-white"></div>
        <span>or</span>
        <div className="h-[1px] w-full bg-white"></div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Custom hosting provider</h2>
        <p className="text-sm ml-4">
          These are the only{' '}
          <span className="font-bold">environment variables</span> that you have
          to set at your hosting provider.
        </p>

        {passphrases.passphrases.map((passphrase) => (
          <div key={passphrase.stageName} className="flex flex-col gap-4">
            <h3 className="text-md">{passphrase.stageName}</h3>

            <div className="grid grid-cols-[1fr_1fr] gap-2 ml-4">
              <div>Key</div>
              <div>Value</div>
              <div>
                <WithCopyButton textToCopy="GITENVS_STAGE">
                  <Input readOnly defaultValue="GITENVS_STAGE" />
                </WithCopyButton>
              </div>
              <div>
                <WithCopyButton textToCopy={passphrase.stageName}>
                  <Input readOnly defaultValue={passphrase.stageName} />
                </WithCopyButton>
              </div>
              <div>
                <WithCopyButton
                  textToCopy={`GITENVS_PRIVATE_KEY_PASSPHRASE_${passphrase.stageName.toUpperCase()}`}
                >
                  <Input
                    readOnly
                    defaultValue={`GITENVS_PRIVATE_KEY_PASSPHRASE_${passphrase.stageName.toUpperCase()}`}
                  />
                </WithCopyButton>
              </div>
              <div>
                <WithCopyButton textToCopy={passphrase.passphrase}>
                  <Input
                    readOnly
                    defaultValue={passphrase.passphrase}
                    type="password"
                  />
                </WithCopyButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={async () => onNext()}>Done</Button>
    </div>
  )
}
