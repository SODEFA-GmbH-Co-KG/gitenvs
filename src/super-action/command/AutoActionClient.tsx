'use client'

import { useEffect, useRef } from 'react'

export const AutoActionClient = ({
  action,
}: {
  action: () => Promise<void>
}) => {
  const ref = useRef(false)
  useEffect(() => {
    if (ref.current) return
    ref.current = true
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    action()
  })
  return null
}
