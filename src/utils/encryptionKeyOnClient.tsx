'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { hexToUint8Array } from 'uint8array-extras'

const encryptionTokenAtom = atomWithStorage<string | null>(
  'encryptionToken',
  null,
)

export const EncryptionTokenSideEffect = () => {
  const setEncryptionToken = useSetAtom(encryptionTokenAtom)
  useEffect(() => {
    const onHashChange = () => {
      const hashString = location.hash.substring(1)
      const hashParams = new URLSearchParams(hashString)
      const encryptionToken = hashParams.get('token')
      if (encryptionToken) {
        setEncryptionToken(encryptionToken)
      }
    }
    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return null
}

export const useEncryptionKeyOnClient = () => {
  const encryptionToken = useAtomValue(encryptionTokenAtom)
  return useCallback(() => {
    if (!encryptionToken) {
      throw new Error('No encryption token found')
    }

    return globalThis.crypto.subtle.importKey(
      'raw',
      hexToUint8Array(encryptionToken),
      {
        name: 'AES-GCM',
      },
      false,
      ['encrypt', 'decrypt'],
    )
  }, [encryptionToken])
}
