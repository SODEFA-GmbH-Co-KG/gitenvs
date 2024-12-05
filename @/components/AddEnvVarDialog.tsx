'use client'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { type SuperAction } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'
import { type AddEnvVarFormData } from './AddNewEnvVar'
import { KeyShortcut } from './KeyShortcut'
import { Label } from './ui/label'

export const AddEnvVarDialog = ({
  saveAction,
}: {
  saveAction: SuperAction<void, AddEnvVarFormData>
}) => {
  const [show, setShow] = useState(false)

  const { isLoading, trigger } = useSuperAction({
    action: saveAction,
    catchToast: true,
  })
  const [formData, setFormData] = useState<
    Pick<AddEnvVarFormData, 'key' | 'value'>
  >({
    key: '',
    value: '',
  })
  return (
    <form
      className={'flex flex-col gap-4'}
      // onSubmit={async (event) => {
      //   event.preventDefault()
      //   const form = event.target
      //   if (!(form instanceof HTMLFormElement)) return
      //   const formData = new FormData(form)
      //   await trigger({ formData, encrypt: true })
      // }}
    >
      <div className="flex flex-col justify-stretch gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <Label htmlFor={'key'}>Key</Label>
          <Input
            type="text"
            autoComplete="off"
            name={'key'}
            value={formData?.key}
            onChange={(event) =>
              setFormData((formdata) => ({
                ...formdata,
                key: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <Label htmlFor={'value'}>Value</Label>
          <div className="flex flex-row focus-within:rounded focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
            <Input
              className={cn(
                'col-span-3 rounded-r-none border-r-0 outline-none focus-within:outline-none focus:outline-none focus:ring-0 focus-visible:ring-0',
                !show && 'text-security-disc',
              )}
              type="text"
              name={'value'}
              autoComplete="off"
              value={formData?.value}
              onChange={(event) =>
                setFormData((formdata) => ({
                  ...formdata,
                  value: event.target.value,
                }))
              }
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  if (event.shiftKey) {
                    await trigger({ ...formData, encrypt: false })
                    return
                  }
                  await trigger({ ...formData, encrypt: true })
                  return
                }
              }}
            />
            <Button
              className="rounded-l-none"
              variant={'outline'}
              type="button"
              size={'icon'}
              onClick={() => setShow(!show)}
            >
              {show ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div className="flex flex-col gap-4">
          <Button
            variant={'outline'}
            type="button"
            onClick={() => trigger({ ...formData, encrypt: false })}
            className="flex flex-row gap-2"
          >
            <span>Save plain</span>
            <div className="flex flex-row gap-1">
              <KeyShortcut>Shift</KeyShortcut>
              <KeyShortcut>Enter</KeyShortcut>
            </div>
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => trigger({ ...formData, encrypt: true })}
            className="flex flex-row gap-2"
          >
            <span>Save encrypted</span>
            <KeyShortcut>Enter</KeyShortcut>
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
