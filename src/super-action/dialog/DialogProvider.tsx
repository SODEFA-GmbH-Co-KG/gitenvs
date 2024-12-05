'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useCallback } from 'react'
import { type SuperActionDialog } from '../action/createSuperAction'

const renderAtom = atom<ReactNode>(null)

export const DialogProvider = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - shrug
  const render = useAtomValue(renderAtom)
  return <>{render}</>
}

export const useShowDialog = () => {
  const setRender = useSetAtom(renderAtom)
  return useCallback(
    async (dialog: SuperActionDialog) => {
      const confirmed = await new Promise<boolean>((res) => {
        const newRender = dialog && (
          <SuperDialog dialog={dialog} onConfirm={res} />
        )
        setRender(newRender)
      })
      setRender(null) // close dialog on confirm
      return confirmed
    },
    [setRender],
  )
}

const SuperDialog = ({
  dialog,
  onConfirm,
}: {
  dialog: NonNullable<SuperActionDialog>
  onConfirm?: (value: boolean) => void
}) => {
  const setRender = useSetAtom(renderAtom)
  return (
    <>
      <Dialog
        defaultOpen={true}
        onOpenChange={(open) => {
          if (!open) {
            setRender(null)
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:w-fit sm:min-w-96 sm:max-w-[90vw]">
          {dialog.title && (
            <DialogHeader>
              <DialogTitle>{dialog.title}</DialogTitle>
            </DialogHeader>
          )}
          <div className="overflow-auto px-1">{dialog.content}</div>
          {(!!dialog.confirm || !!dialog.cancel) && (
            <DialogFooter>
              {dialog.cancel && (
                <Button variant={'outline'} onClick={() => onConfirm?.(false)}>
                  {dialog.cancel}
                </Button>
              )}
              {dialog.confirm && (
                <Button onClick={() => onConfirm?.(true)} autoFocus>
                  {dialog.confirm}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
