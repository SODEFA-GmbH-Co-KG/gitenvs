'use client'

import { useEffect } from 'react'

export const TableKeydownHandler = ({ columns }: { columns: number }) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        document.activeElement?.parentElement?.id !== 'supergrid' &&
        !(document.activeElement instanceof HTMLInputElement)
      ) {
        if (
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowDown'
        ) {
          document
            .querySelector<HTMLElement>('#supergrid > *[tabindex="0"]')
            ?.focus()
          return
        }
      } else {
        if (event.key === 'ArrowLeft') {
          const element = document.activeElement?.previousElementSibling
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
        if (event.key === 'ArrowRight') {
          const element = document.activeElement?.nextElementSibling
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
        if (event.key === 'ArrowUp') {
          let element: Element | null | undefined = document.activeElement
          for (let i = 0; i < columns; i++) {
            element = element?.previousElementSibling
          }
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
        if (event.key === 'ArrowDown') {
          let element: Element | null | undefined = document.activeElement
          for (let i = 0; i < columns; i++) {
            element = element?.nextElementSibling
          }
          if (element instanceof HTMLElement) {
            element?.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [columns])

  return null
}
