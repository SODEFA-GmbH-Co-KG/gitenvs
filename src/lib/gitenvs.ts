'use server'

import { saveGitenvs as saveGitenvsRaw } from '@/gitenvs/gitenvs'
import { savePassphraseToFolder as savePassphraseToFolderRaw } from '@/gitenvs/savePassphraseToFolder'
import { revalidatePath } from 'next/cache'

export const saveGitenvs = async (
  options: Parameters<typeof saveGitenvsRaw>[0],
) => {
  const result = await saveGitenvsRaw(options)
  revalidatePath('/', 'layout')
  return result
}

export const savePassphraseToFolder = async (
  options: Parameters<typeof savePassphraseToFolderRaw>[0],
) => {
  const result = await savePassphraseToFolderRaw(options)
  revalidatePath('/', 'layout')
  return result
}
