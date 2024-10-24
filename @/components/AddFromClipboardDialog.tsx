import { filter, find, map } from 'lodash-es'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { streamRevalidatePath } from '~/super-action/action/streamRevalidatePath'
import { type AddFromClipboardSchema } from './AddFromClipboardDialogClient'
import { PasteEnvVars } from './PasteEnvVars'
import { getGitenvs } from '@/gitenvs/gitenvs'
import { saveGitenvs } from '~/lib/gitenvs'

export const AddFromClipboardDialog = async ({
  fileId,
}: {
  fileId: string
}) => {
  const gitenvs = await getGitenvs()
  return (
    <>
      <PasteEnvVars gitenvs={gitenvs} fileId={fileId} />
    </>
  )
}
