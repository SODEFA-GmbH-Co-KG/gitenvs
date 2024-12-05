import { generateEnvFiles } from '@/gitenvs/generateEnvFiles'
import { checkShouldRegenerateEnvFiles } from '@/gitenvs/gitenvs'
import { FileKey } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { superAction } from '~/super-action/action/createSuperAction'
import { ActionButton } from '~/super-action/button/ActionButton'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const GenerateEnvFilesButton = async () => {
  const shouldRegenerate = await checkShouldRegenerateEnvFiles()

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <ActionButton
            variant={shouldRegenerate ? 'default' : 'outline'}
            className="border"
            action={async () => {
              'use server'
              return superAction(async () => {
                await generateEnvFiles({
                  stage: 'development',
                })
                revalidatePath('/', 'layout')
              })
            }}
          >
            <FileKey />
          </ActionButton>
        </TooltipTrigger>
        <TooltipContent>
          {shouldRegenerate
            ? 'Your env files are outdated, regenerate them'
            : 'Regenerate env files'}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
