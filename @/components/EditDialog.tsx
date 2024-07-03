import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import NiceModal, { useModal } from '@ebay/nice-modal-react'

export const EditDialog = NiceModal.create(() => {
  const modal = useModal()
  return (
    <Dialog open={modal.visible} onOpenChange={(show) => !show && modal.hide()}>
      <DialogContent className=" bg-gradient-to-b from-[#4b0082] to-[#1a0033] text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Env Var</DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here.
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input className="col-span-3" type="text" />
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
