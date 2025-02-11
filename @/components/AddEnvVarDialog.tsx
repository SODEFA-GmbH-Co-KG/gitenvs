'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, FunctionSquare } from 'lucide-react'
import { Roboto_Mono } from 'next/font/google'
import { useMemo, useState } from 'react'
import { type SuperAction } from '~/super-action/action/createSuperAction'
import { useSuperAction } from '~/super-action/action/useSuperAction'
import { type AddEnvVarFormData } from './AddNewEnvVar'
import { KeyShortcut } from './KeyShortcut'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

// If loading a variable font, you don't need to specify the font weight
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

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
    Pick<AddEnvVarFormData, 'key' | 'value' | 'isFunction'>
  >({
    key: '',
    value: '',
    isFunction: false,
  })

  const evaledValue = useMemo(() => {
    if (!formData.isFunction) return null
    try {
      const evaled = eval(formData.value) as string
      return evaled?.toString() ?? 'undefined'
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      }
      return 'Unknown error'
    }
  }, [formData.isFunction, formData.value])

  return (
    <form className={'flex flex-col gap-4'}>
      <div className="flex flex-col justify-stretch gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <Label htmlFor={'key'}>Key</Label>
          <Input
            className={robotoMono.className}
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
                robotoMono.className,
              )}
              placeholder={formData.isFunction ? 'Date.now()' : ''}
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

      {formData.isFunction ? (
        <div className="flex flex-row gap-2 text-xs text-muted-foreground">
          <span>Eval: </span>
          <span className="">{evaledValue}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2">
          <Switch
            id="isFunction"
            checked={formData.isFunction}
            onCheckedChange={(checked) => {
              setFormData((formdata) => ({
                ...formdata,
                isFunction: checked === true,
              }))
              if (checked) {
                setShow(true)
              }
            }}
          ></Switch>
          <Label htmlFor="isFunction" className="flex gap-2">
            Is function
            <FunctionSquare className="h-4 w-4" />
          </Label>
        </div>
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
    </form>
  )
}
