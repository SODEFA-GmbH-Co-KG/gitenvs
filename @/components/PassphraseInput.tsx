'use client'

import { ShieldEllipsis } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import {
  decryptWithEncryptionKey,
  type EncryptedValue,
} from '~/utils/encryptionToken'
import { Input } from './ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const PassphraseInput = ({
  encryptedPassphrase,
}: {
  encryptedPassphrase?: EncryptedValue
}) => {
  const [value, setValue] = useState<string | null>(null)

  const getEncryptionKey = useEncryptionKeyOnClient()

  useEffect(() => {
    if (!encryptedPassphrase) {
      return
    }
    const decrypt = async () => {
      const encryptionKey = await getEncryptionKey()
      if (!encryptionKey) {
        throw new Error('No encryption key found')
      }

      const decrypted = await decryptWithEncryptionKey({
        ...encryptedPassphrase,
        key: await getEncryptionKey(),
      })
      setValue(decrypted)
    }

    void decrypt()
  }, [encryptedPassphrase, getEncryptionKey])

  return (
    <div className="flex items-center">
      {!value ? (
        <Input
          className="text-security-disc flex flex-col gap-2"
          autoComplete="off"
          type="text"
        ></Input>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <ShieldEllipsis className="h-4 w-4 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>Loaded from file system</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
