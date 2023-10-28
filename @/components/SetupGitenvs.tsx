import { useState } from 'react'
import { type RouterOutputs } from '~/utils/api'
import { CopyPassphrases } from './CopyPassphrases'
import { CreateGitenvs } from './CreateGitenvs'

export const SetupGitenvs = () => {
  const [passphrases, setPassphrases] = useState<
    RouterOutputs['gitenvs']['createGitenvsJson'] | null
  >(null)

  const [copied, setCopied] = useState(false)

  if (!passphrases) {
    return (
      <CreateGitenvs
        onPassphrases={(passphrases) => setPassphrases(passphrases)}
      />
    )
  }

  return (
    <CopyPassphrases passphrases={passphrases} onNext={() => setCopied(true)} />
  )
}
