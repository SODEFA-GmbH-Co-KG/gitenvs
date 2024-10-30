'use server'

import { saveGitenvs as saveGitenvsRaw } from '@/gitenvs/gitenvs'
import { savePassphrasesToFolder as savePassphrasesToFolderRaw } from '@/gitenvs/savePassphraseToFolder'
import { revalidatePath } from 'next/cache'

export const saveGitenvs = async (
  options: Parameters<typeof saveGitenvsRaw>[0],
) => {
  const result = await saveGitenvsRaw(options)
  revalidatePath('/', 'layout')
  return result
}

export const savePassphrasesToFolder = async (
  options: Parameters<typeof savePassphrasesToFolderRaw>[0],
) => {
  const result = await savePassphrasesToFolderRaw(options)
  revalidatePath('/', 'layout')
  return result
}
