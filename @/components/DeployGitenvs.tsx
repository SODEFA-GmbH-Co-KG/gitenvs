'use client'

import { getPassphraseEnvName, GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { passphrasesAtom } from '@/passphrasesAtom'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { CopyButton } from './CopyButton'
import { Button } from './ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import { Input } from './ui/input'

export const DeployGitenvs = () => {
  const [passphrases] = useAtom(passphrasesAtom)
  const router = useRouter()

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your hosting provider</h1>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl">Easy deployment via CLI</h2>
        <p className="ml-4 text-sm">
          We can deploy the environment variables to these providers
          automatically.
        </p>
        <Button
          variant="outline"
          className="self-center"
          onClick={() => alert('Not implemented, yet.')}
        >
          🚀 Deploy to Vercel
        </Button>
      </div>

      <div className="flex flex-row items-center gap-4">
        <div className="h-[1px] w-full bg-white"></div>
        <span>or</span>
        <div className="h-[1px] w-full bg-white"></div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Custom hosting provider</h2>
        <p className="ml-4 text-sm">
          These are the only{' '}
          <span className="font-bold">environment variables</span> that you have
          to set at your hosting provider.
        </p>

        <Collapsible>
          <div className="flex flex-col items-center justify-center">
            <CollapsibleTrigger>
              <Button variant="outline">Show me how</Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="flex flex-col gap-4">
              {passphrases.map((passphrase) => {
                const dotenvFormat = `${GITENVS_STAGE_ENV_NAME}=${passphrase.stageName}
              ${getPassphraseEnvName({ stage: passphrase.stageName })}=${
                passphrase.passphrase
              }`
                return (
                  <div
                    key={passphrase.stageName}
                    className="flex flex-col gap-4"
                  >
                    <h3 className="text-md">{passphrase.stageName}</h3>
                    <div className="ml-4 grid grid-cols-[1fr_1fr] gap-4">
                      <div>Key</div>
                      <div>Value</div>
                      <div>
                        <InputWithCopyButton content={GITENVS_STAGE_ENV_NAME} />
                      </div>
                      <div>
                        <InputWithCopyButton content={passphrase.stageName} />
                      </div>
                      <div>
                        <InputWithCopyButton
                          content={getPassphraseEnvName({
                            stage: passphrase.stageName,
                          })}
                        />
                      </div>
                      <div>
                        <InputWithCopyButton
                          content={passphrase.passphrase}
                          isPassword
                        />
                      </div>
                      <CopyButton
                        textToCopy={dotenvFormat}
                        additionalText="Copy in .env format"
                        className="col-span-2"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button onClick={() => router.push('/setup/project')}>Done</Button>
    </div>
  )
}

export const InputWithCopyButton = ({
  content,
  isPassword = false,
}: {
  content: string
  isPassword?: boolean
}) => {
  return (
    <div className="flex flex-1 flex-row gap-2">
      <Input
        readOnly
        defaultValue={content}
        type={isPassword ? 'password' : 'text'}
      />
      <CopyButton textToCopy={content} />
    </div>
  )
}
