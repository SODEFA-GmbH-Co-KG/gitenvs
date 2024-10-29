'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { forwardRef, useCallback } from 'react'
import { Switch } from '../ui/switch'

type SimpleParamSelectOptions = {
  paramKey: string
  mode?: 'push' | 'replace'
}

export const SimpleParamSwitch = forwardRef<
  React.ElementRef<typeof Switch>,
  React.ComponentPropsWithoutRef<typeof Switch> & SimpleParamSelectOptions
>(({ className, paramKey, mode = 'push', ...props }, ref) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

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

  return <Switch ref={ref} {...props} onCheckedChange={change} />
})
