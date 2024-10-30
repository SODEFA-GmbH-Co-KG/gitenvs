import { cn } from '@/lib/utils'
import { type PropsWithChildren } from 'react'
export const Hr = ({
  children,
  thin = false,
  marginX = false,
  outerClassName,
}: PropsWithChildren<{
  thin?: boolean
  marginX?: boolean
  outerClassName?: string
}>) => {
  return (
    <div
      className={cn(
        'relative flex items-center',
        !thin && 'py-5',
        marginX && 'mx-5',
        outerClassName,
      )}
    >
      <div className="flex-grow border-t border-neutral-700"></div>
      {children && (
        <span className="mx-2 flex-shrink text-xs text-neutral-400">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-neutral-700"></div>
    </div>
  )
}
