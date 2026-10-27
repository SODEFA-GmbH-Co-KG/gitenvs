'use client'

import { type PassphraseSource } from '@/gitenvs/rerollPassphrases'
import { useAtomValue } from 'jotai'
import { ArrowLeft, Dices, SearchCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { type SuperAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { useEncryptionKeyOnClient } from '~/utils/encryptionKeyOnClient'
import {
  encryptWithEncryptionKey,
  type EncryptedValue,
} from '~/utils/encryptionToken'
import { stageEncryptionStateAtom } from './AtomifyPassphrase'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export type RerollStageStatus = {
  stageName: string
  envName: string
  inFile: boolean
  inEnv: boolean
  conflict: boolean
  encryptedValues: number
}

export type RerollInput = {
  stageNames: string[]
  passphraseSources: Record<string, PassphraseSource>
  encryptedPassphrases: {
    stageName: string
    encryptedPassphrase: EncryptedValue
  }[]
  dryRun: boolean
}

type Source = PassphraseSource | 'manual'

const getDefaultSource = (stage: RerollStageStatus): Source | undefined => {
  if (stage.conflict) return undefined
  if (stage.inFile) return 'file'
  if (stage.inEnv) return 'env'
  return 'manual'
}

export const RerollPassphrasesForm = ({
  stages,
  passphraseFileName,
  action,
}: {
  stages: RerollStageStatus[]
  passphraseFileName: string
  action: SuperAction<unknown, RerollInput>
}) => {
  const stageEncryptionState = useAtomValue(stageEncryptionStateAtom)
  const getEncryptionKeyOnClient = useEncryptionKeyOnClient()

  const [selected, setSelected] = useState(() => stages.map((s) => s.stageName))
  const [sources, setSources] = useState<Record<string, Source | undefined>>(
    () =>
      Object.fromEntries(stages.map((s) => [s.stageName, getDefaultSource(s)])),
  )
  const [manual, setManual] = useState<Record<string, string>>({})

  // passphrases only known in the browser (e.g. pasted) prefill the input
  const getManualPassphrase = (stageName: string) =>
    manual[stageName] ??
    stageEncryptionState?.find((s) => s.stageName === stageName)?.passphrase ??
    ''

  const selectedStages = stages.filter((s) => selected.includes(s.stageName))
  const missingChoice = selectedStages.find(
    (s) =>
      !sources[s.stageName] ||
      (sources[s.stageName] === 'manual' &&
        s.encryptedValues > 0 &&
        !getManualPassphrase(s.stageName)),
  )

  const run = async (dryRun: boolean) => {
    const key = await getEncryptionKeyOnClient()
    if (!key) throw new Error('No encryption key found')

    const passphraseSources: Record<string, PassphraseSource> = {}
    const encryptedPassphrases: RerollInput['encryptedPassphrases'] = []
    for (const { stageName } of selectedStages) {
      const source = sources[stageName]
      if (source === 'file' || source === 'env') {
        passphraseSources[stageName] = source
        continue
      }
      const passphrase = getManualPassphrase(stageName)
      if (!passphrase) continue
      encryptedPassphrases.push({
        stageName,
        encryptedPassphrase: await encryptWithEncryptionKey({
          plaintext: passphrase,
          key,
        }),
      })
    }

    return action({
      stageNames: selectedStages.map((s) => s.stageName),
      passphraseSources,
      encryptedPassphrases,
      dryRun,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[auto_1fr_1.5fr] items-center gap-x-4 gap-y-3">
        {stages.map((stage) => {
          const isSelected = selected.includes(stage.stageName)
          const source = sources[stage.stageName]
          return (
            <div key={stage.stageName} className="contents">
              <Checkbox
                id={`reroll-${stage.stageName}`}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  setSelected((prev) =>
                    checked
                      ? [...prev, stage.stageName]
                      : prev.filter((s) => s !== stage.stageName),
                  )
                }
              />
              <Label
                htmlFor={`reroll-${stage.stageName}`}
                className="flex flex-col gap-1"
              >
                <span>{stage.stageName}</span>
                <span className="text-xs text-muted-foreground">
                  {stage.encryptedValues} encrypted{' '}
                  {stage.encryptedValues === 1 ? 'value' : 'values'}
                </span>
              </Label>
              <div className="flex flex-col gap-2">
                <Select
                  value={source}
                  disabled={!isSelected}
                  onValueChange={(value) =>
                    setSources((prev) => ({
                      ...prev,
                      [stage.stageName]: value as Source,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose old passphrase" />
                  </SelectTrigger>
                  <SelectContent>
                    {stage.inFile && (
                      <SelectItem value="file">{passphraseFileName}</SelectItem>
                    )}
                    {stage.inEnv && (
                      <SelectItem value="env">{stage.envName}</SelectItem>
                    )}
                    <SelectItem value="manual">Enter passphrase</SelectItem>
                  </SelectContent>
                </Select>
                {isSelected && stage.conflict && !source && (
                  <p className="text-xs text-destructive">
                    {passphraseFileName} and {stage.envName} differ. Choose
                    which one is the current passphrase.
                  </p>
                )}
                {isSelected && source === 'manual' && (
                  <Input
                    type="password"
                    placeholder={`Current ${stage.stageName} passphrase`}
                    value={getManualPassphrase(stage.stageName)}
                    onChange={(e) =>
                      setManual((prev) => ({
                        ...prev,
                        [stage.stageName]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton
          variant={'outline'}
          className="flex-1"
          disabled={!selectedStages.length || !!missingChoice}
          action={() => run(true)}
        >
          <SearchCheck className="size-4" />
          Check first (dry run)
        </ActionButton>
        <ActionButton
          className="flex-1"
          disabled={!selectedStages.length || !!missingChoice}
          askForConfirmation={{
            title: `Reroll ${selectedStages.map((s) => s.stageName).join(', ')}?`,
            content:
              'New passphrases are created and saved to your passphrase file. You have to update them everywhere they are used.',
            confirm: 'Yes, reroll',
            cancel: 'Cancel',
          }}
          action={() => run(false)}
        >
          <Dices className="size-4" />
          Reroll {selectedStages.length === stages.length
            ? 'all'
            : 'selected'}{' '}
          stages
        </ActionButton>
      </div>
      {!!missingChoice && (
        <p className="text-center text-sm text-muted-foreground">
          Choose or enter the current passphrase for {missingChoice.stageName}.
        </p>
      )}
      <Link href="/">
        <Button variant={'outline'} className="w-full">
          <ArrowLeft />
          Nope! Nevermind
        </Button>
      </Link>
    </div>
  )
}
