'use client'

import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { type Gitenvs } from '~/gitenvs/gitenvs.schema'
import { KeyShortcut } from './KeyShortcut'

export const EnvFileSwitcher = ({
  gitenvs,
  activeFileId,
}: {
  gitenvs: Gitenvs
  activeFileId: string
}) => {
  const router = useRouter()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      let key = parseInt(event.key, 10)
      if (Number.isNaN(key)) return
      if (key === 0) key = 10
      if (key >= 0 && key <= Math.min(10, gitenvs.envFiles.length)) {
        const id = gitenvs.envFiles[key - 1]?.id
        if (!id) return
        router.push(`/file/${id}`)
      }
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [gitenvs, router])

  return (
    <div className="flex flex-row gap-4">
      {gitenvs.envFiles.map((envFile, index) => {
        return (
          <div key={envFile.id}>
            <a
              href={`/file/${envFile.id}`}
              className={cn(
                'flex h-7 flex-row items-center justify-center gap-2 rounded-full px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary',
                envFile.id === activeFileId && 'bg-muted text-primary',
              )}
            >
              <span>{envFile.name}</span>
              <KeyShortcut>{index + 1}</KeyShortcut>
            </a>
          </div>
        )
      })}
    </div>
  )
}
