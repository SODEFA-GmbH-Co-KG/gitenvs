'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { forwardRef, useCallback } from 'react'
import { Button } from '../ui/button'

type SimpleParamButtonProps = {
  paramKey: string
  mode?: 'push' | 'replace'
}

export const SimpleParamButton = forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & SimpleParamButtonProps
>(({ paramKey, mode = 'push', ...props }, ref) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { children, ...rest } = props

  const valueFromSearchParams = searchParams.get(paramKey)

  const change = useCallback(
    (checked: boolean) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      if (checked) {
        newSearchParams.set(paramKey, 'true')
      } else {
        newSearchParams.delete(paramKey)
      }
      return router[mode](`${pathname}?${newSearchParams.toString()}`)
    },
    [router, pathname, searchParams, paramKey, mode],
  )

  return (
    <Button ref={ref} {...rest} onClick={() => change(!valueFromSearchParams)}>
      {children}
    </Button>
  )
})

SimpleParamButton.displayName = 'SimpleParamButton'
