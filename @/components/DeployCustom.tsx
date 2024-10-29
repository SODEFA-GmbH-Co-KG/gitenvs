'use client'

import { getPassphraseEnvName, GITENVS_STAGE_ENV_NAME } from '@/gitenvs/env'
import { passphrasesAtom } from '@/passphrasesAtom'
import { useAtom } from 'jotai'
import { CopyButton } from './CopyButton'
import { Input } from './ui/input'

export const DeployCustom = () => {
  const [passphrases] = useAtom(passphrasesAtom)

  return (
    <div className="flex flex-col gap-4">
      {passphrases.map((passphrase) => {
        const dotenvFormat = `${GITENVS_STAGE_ENV_NAME}=${passphrase.stageName}
              ${getPassphraseEnvName({ stage: passphrase.stageName })}=${
                passphrase.passphrase
              }`
        return (
          <div key={passphrase.stageName} className="flex flex-col gap-4">
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
