import { revalidatePath } from 'next/cache'
import { streamAction } from './createSuperAction'

export const streamRevalidatePath = (
  ...args: Parameters<typeof revalidatePath>
) => {
  return streamAction(async () => {
    'use server'
    revalidatePath(...args)
  })
}
