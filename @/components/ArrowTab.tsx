'use client'

import { initArrowTab } from 'arrowtab'
import { useEffect } from 'react'

export const ArrowTab = () => {
  useEffect(() => {
    const { cleanup } = initArrowTab({ autoDetectHistory: true })

    return () => {
      cleanup()
    }
  }, [])

  return null
}
