import { getGitenvs } from '@/gitenvs/gitenvs'
import { MoreVertical, Plus } from 'lucide-react'
import {
  streamDialog,
  superAction,
} from '~/super-action/action/createSuperAction'
import { ActionWrapper } from '~/super-action/button/ActionWrapper'
import { AddNewStage } from './AddNewStage'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const MainDropdown = async ({ className }: { className?: string }) => {
  const gitenvs = await getGitenvs()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <Button variant="ghost" size="icon">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent forceMount data-arrowtab="disable-down disable-up">
        <ActionWrapper
          command={{
            label: 'Add new Stage',
            group: 'Next Best Action',
          }}
          action={async () => {
            'use server'
            return superAction(async () => {
              streamDialog({
                title: 'Add new Stage',
                content: <AddNewStage gitenvs={gitenvs} />,
              })
            })
          }}
        >
          <DropdownMenuItem className="flex items-center gap-2">
            <Plus className="size-4" />
            Add new Stage
          </DropdownMenuItem>
        </ActionWrapper>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Setup</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent data-arrowtab="disable-down disable-up">
                <DropdownMenuItem>
                  <a href="/setup/save" className="w-full">
                    Goto Save Passphrases
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/setup/project" className="w-full">
                    Goto Setup Project
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/setup/import" className="w-full">
                    Goto Import
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/setup/deploy" className="w-full">
                    Goto Deploy
                  </a>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
