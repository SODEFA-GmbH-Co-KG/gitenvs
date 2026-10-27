import { ResetStageEncryptionState } from '@/components/AtomifyPassphrase'
import { CopyPassphrases } from '@/components/CopyPassphrases'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getPassphraseEnvName } from '@/gitenvs/env'
import { BACKUP_DIR_NAME, PASSPHRASE_FILE_NAME } from '@/gitenvs/getPassphrase'
import { getProjectRoot } from '@/gitenvs/getProjectRoot'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { HardDrive } from 'lucide-react'
import { z } from 'zod'

const allowedRedirects = ['/']

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    redirect: string
    rerolled?: string
    staleEnv?: string
  }>
}) {
  const { redirect, rerolled, staleEnv } = await searchParams
  if (!!redirect && !allowedRedirects.includes(redirect)) {
    throw new Error('Invalid redirect')
  }
  const projectName = await getProjectName().catch(() => undefined)
  return (
    <>
      {!!rerolled && (
        <>
          <ResetStageEncryptionState rerolledStages={rerolled.split(',')} />
          <RerollNotice
            stages={rerolled.split(',')}
            staleEnvNames={staleEnv?.split(',') ?? []}
          />
        </>
      )}
      <CopyPassphrases projectName={projectName} redirect={redirect} />
    </>
  )
}

const getProjectName = async () => {
  const { projectRoot } = await getProjectRoot()
  const packageJson = await readFile(join(projectRoot, 'package.json'), 'utf-8')
  const packageJsonParsed = z
    .object({ name: z.string() })
    .parse(JSON.parse(packageJson))
  return packageJsonParsed.name
}

const RerollNotice = ({
  stages,
  staleEnvNames,
}: {
  stages: string[]
  staleEnvNames: string[]
}) => {
  return (
    <Alert className="max-w-lg">
      <AlertTitle className="flex items-center gap-2">
        <HardDrive className="size-4" />
        Passphrases rerolled – now it&apos;s your turn
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          The new passphrases for {stages.join(', ')} are saved on disk in{' '}
          <code className="font-bold">{PASSPHRASE_FILE_NAME}</code> so they
          can&apos;t get lost. Store them in your password manager and update
          them everywhere they are used:
        </p>
        <ul className="list-inside list-disc">
          {stages.map((stage) => (
            <li key={stage}>
              <code>{getPassphraseEnvName({ stage })}</code>
            </li>
          ))}
        </ul>
        {staleEnvNames.length > 0 && (
          <p>
            <code className="font-bold">{staleEnvNames.join(', ')}</code> is set
            in the environment gitenvs was started from and still holds the old
            passphrase. Update or unset it before running gitenvs again.
          </p>
        )}
        <p>
          The old passphrases are in{' '}
          <code className="font-bold">{BACKUP_DIR_NAME}/</code>. Delete it once
          everything is updated.
        </p>
      </AlertDescription>
    </Alert>
  )
}
