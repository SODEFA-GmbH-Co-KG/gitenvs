import { DeployGitenvs } from '@/components/DeployGitenvs'
import { ImportFromFile } from '@/components/ImportFromFile'
import { SetupGitenvs } from '@/components/SetupGitenvs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { step: string } }) {
  if (params.step === 'init') {
    return (
      <SetupGitenvs
        onSetupDone={async () => {
          'use server'
          // revalidatePath('/', 'layout')
          redirect('/setup/import')
        }}
      />
    )
  }

  if (params.step === 'import') {
    return (
      <ImportFromFile
        onNext={async () => {
          'use server'
          // revalidatePath('/', 'layout')
          redirect('/setup/deploy')
        }}
      />
    )
  }

  return (
    <DeployGitenvs
      onNext={async () => {
        'use server'
        revalidatePath('/', 'layout')
        redirect('/')
      }}
    />
  )
}
