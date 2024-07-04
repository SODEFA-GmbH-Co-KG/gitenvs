'use client'

import { useState } from 'react'
import { type Passphrase } from '~/gitenvs/gitenvs.schema'
import { CopyPassphrases } from './CopyPassphrases'
import { CreateGitenvs } from './CreateGitenvs'
import { DeployGitenvs } from './DeployGitenvs'

export const SetupGitenvs = ({ onSetupDone }: { onSetupDone: () => void }) => {
  const [passphrases, setPassphrases] = useState<Passphrase[] | null>(null)

  const [copied, setCopied] = useState(false)

  if (!passphrases) {
    return (
      <CreateGitenvs
        onPassphrases={(passphrases) => setPassphrases(passphrases)}
      />
    )
  }

  if (!copied) {
    return (
      <CopyPassphrases
        passphrases={passphrases}
        onNext={() => setCopied(true)}
      />
    )
  }

  return (
    <DeployGitenvs passphrases={passphrases} onNext={() => onSetupDone()} />
  )
}
