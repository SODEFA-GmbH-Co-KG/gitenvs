'use client'

import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useShowDialog } from '../dialog/DialogProvider'
import { consumeSuperActionResponse } from './consumeSuperActionResponse'
import { type SuperAction, type SuperActionDialog } from './createSuperAction'

export type UseSuperActionOptions<Output, Input> = {
  action: SuperAction<Output, Input>
  disabled?: boolean
  catchToast?: boolean
  askForConfirmation?: boolean | SuperActionDialog
  stopPropagation?: boolean
}

export const useSuperAction = <Output = undefined, Input = undefined>(
  options: UseSuperActionOptions<Output, Input>,
) => {
  const [isLoading, setIsLoading] = useState(false)

  const { action, disabled, catchToast, askForConfirmation, stopPropagation } =
    options

  const router = useRouter()
  const showDialog = useShowDialog()

  const trigger = useCallback(
    async (input: Input, evt?: MouseEvent) => {
      if (isLoading) return
      if (disabled) return
      if (stopPropagation) {
        evt?.stopPropagation()
        evt?.preventDefault()
      }
      if (askForConfirmation) {
        const dialogOptions =
          typeof askForConfirmation === 'object' ? askForConfirmation : {}
        const res = await showDialog({
          title: 'Are you sure?',
          confirm: 'Yes',
          cancel: 'No',
          ...dialogOptions,
        })
        if (!res) return
      }
      setIsLoading(true)

      const response = await action(input)

      if (response && 'superAction' in response) {
        await consumeSuperActionResponse({
          response: Promise.resolve(response.superAction),
          onToast: (t) => {
            toast({
              title: t.title,
              description: t.description,
            })
          },
          onDialog: async (d) => {
            await showDialog(d)
          },
          onRedirect: (r) => {
            if (r.type === 'push') {
              router.push(r.url)
            } else {
              router.replace(r.url)
            }
          },
          catch: catchToast
            ? (e) => {
                toast({
                  variant: 'destructive',
                  title: e.message,
                })
              }
            : undefined,
        })
      }

      setIsLoading(false)
    },
    [
      isLoading,
      disabled,
      stopPropagation,
      askForConfirmation,
      action,
      showDialog,
      catchToast,
      router,
    ],
  )

  return {
    trigger,
    isLoading,
  }
}
