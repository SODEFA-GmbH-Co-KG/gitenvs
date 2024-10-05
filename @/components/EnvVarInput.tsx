import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { type EnvStage, type EnvVar } from '@/gitenvs/gitenvs.schema'
import { useState } from 'react'

export const EnvVarInput = ({
  envVar,
  stage,
}: {
  envVar: EnvVar
  stage: EnvStage
}) => {
  const [showContent, setShowContent] = useState(false)

  const encrypted = envVar.values[stage.name]?.encrypted ?? false

  return (
    <div className="flex flex-row gap-2">
      <Input
        key={`${envVar.key}-${stage.name}`}
        className="flex flex-col gap-2"
        type={showContent ? 'text' : 'password'}
        autoComplete="new-password"
      />
      <Toggle
        onPressedChange={(pressed) => console.log('hello')}
        pressed={encrypted}
      >
        {encrypted ? `🔒` : `🔓`}
      </Toggle>
      <Toggle onPressedChange={(pressed) => setShowContent(pressed)}>
        {showContent ? `👀` : `🙈`}
      </Toggle>
      {/* <Button
        onClick={async () => {
          const encrypted = field.values[stageName]?.value
          if (!encrypted) throw new Error('No encrypted value')

          const decrypted = await decryptEnvVar({
            encrypted,
            encryptedPrivateKey: encryptedPrivateKey,
            passphrase: prompt('Passphrase') ?? '',
          })

          console.log('decrypted', decrypted)
        }}
      >
        Decrypt
      </Button> */}
    </div>
  )
}
