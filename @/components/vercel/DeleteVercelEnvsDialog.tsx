'use client'

import { map } from 'lodash-es'
import { type SuperAction } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { DialogFooter } from '../ui/dialog'
import { Label } from '../ui/label'

export const DeleteVercelEnvsDialog = ({
  vercelEnvs,
  onDelete,
  onCancel,
}: {
  vercelEnvs?: { id: string; key: string; target?: string[] | string }[]
  onDelete: SuperAction<void, FormData>
  onCancel: SuperAction<void, void>
}) => {
  const { trigger: triggerOnCancel } = useSuperAction({
    action: onCancel,
  })
  const { isLoading, trigger } = useSuperAction({ action: onDelete })

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.target
        if (!(form instanceof HTMLFormElement)) return
        const formData = new FormData(form)
        await trigger(formData)
      }}
    >
      <div className="flex flex-col gap-4">
        <p>
          You are about to delete the following environment variables from
          Vercel:
        </p>
        <div className="flex flex-col gap-4">
          {vercelEnvs?.map((env) => (
            <div className="flex gap-2" key={env.id}>
              <Checkbox name={env.id} id={env.id} defaultChecked={true} />
              <Label htmlFor={env.id}>
                {env.key} - Target:{' '}
                {typeof env.target === 'string'
                  ? env.target
                  : map(env.target, (t) => t).join(', ')}
              </Label>
            </div>
          ))}
        </div>
        <div>
          Before you submit, make sure you have checked the desired env vars and
          you stored your gitenvs safely (passphrases are saved and gitenvs are
          committed)
        </div>
      </div>
      <DialogFooter>
        <Button
          variant={'outline'}
          type="button"
          onClick={async () => await triggerOnCancel()}
        >
          Cancel
        </Button>

        <Button disabled={isLoading} type="submit">
          Delete
        </Button>
      </DialogFooter>
    </form>
  )
}
