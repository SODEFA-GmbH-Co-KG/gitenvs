import { SetupGitenvs } from '@/components/SetupGitenvs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default function Page() {
  return (
    <SetupGitenvs
      onSetupDone={async () => {
        'use server'
        revalidatePath('/')
        redirect('/')
      }}
    />
  )
}
