'use client'

import { type Passphrase } from '@/gitenvs/gitenvs.schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { CopyPassphrases } from './CopyPassphrases'
import { CreateGitenvs } from './CreateGitenvs'

export const passPhrasesAtom = atom<Passphrase[] | undefined>(undefined)

export const SetupGitenvs = ({ onSetupDone }: { onSetupDone: () => void }) => {
  const setPassphrases = useSetAtom(passPhrasesAtom)

  const passphrases = useAtomValue(passPhrasesAtom)

  if (!passphrases) {
    return (
      <CreateGitenvs
        onPassphrases={(passphrases) => setPassphrases(passphrases)}
      />
    )
  }

  return (
    <CopyPassphrases passphrases={passphrases} onNext={() => onSetupDone()} />
  )
}
