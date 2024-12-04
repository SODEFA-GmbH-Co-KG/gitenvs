import { Plus } from 'lucide-react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { AddEnvVarDialog } from './AddEnvVarDialog'

export const AddNewEnvVar = () => {
  return (
    <>
      <ActionButton
        className="flex-1"
        command={{
          shortcut: {
            key: 'a',
          },
          label: 'Add new env var',
        }}
        action={async () => {
          'use server'

          return superAction(async () => {
            streamDialog({
              title: `Add new env var`,
              content: <AddEnvVarDialog />,
            })
          })
        }}
      >
        <Plus className="mr-2 h-4 w-4 shrink-0" /> Add new env var
      </ActionButton>
      {/* <Input /> */}
      <div></div>
      <div></div>
      <div></div>
    </>
  )
}
