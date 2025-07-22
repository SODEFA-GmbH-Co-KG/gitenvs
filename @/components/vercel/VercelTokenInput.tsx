import { setGlobalConfig } from '@/gitenvs/globalConfig'
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate'
import Link from 'next/link'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionForm } from '~/super-action/form/ActionForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export const TokenInput = ({ closeDialog }: { closeDialog?: boolean }) => {
  return (
    <div className="flex flex-col gap-4">
      <p>
        To deploy to Vercel, you need to set a Vercel token. You can get one
        here:{' '}
        <Link
          className="underline hover:no-underline"
          href="https://vercel.com/account/tokens"
          target="_blank"
          rel="noreferrer"
        >
          https://vercel.com/account/tokens
        </Link>
        .
      </p>
      <ActionForm
        action={async (formData) => {
          'use server'
          return superAction(async () => {
            const vercelToken = formData.get('vercelToken')
            if (typeof vercelToken !== 'string') {
              throw new Error('Vercel token is required')
            }
            await setGlobalConfig({ vercelToken })
            revalidatePath('/setup/deploy')
            revalidatePath('/setup/import')
            if (closeDialog) {
              streamDialog(null)
            }
          })
        }}
      >
        <div className="flex flex-col gap-4">
          <Label>Vercel token</Label>
          <div className="flex flex-row gap-4">
            <Input type="password" name="vercelToken" />
            <Button type="submit" className="self-end">
              Save
            </Button>
          </div>
        </div>
      </ActionForm>
    </div>
  )
}
