'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { debounce } from 'lodash-es'
import { CircleX } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

type SimpleParamInputProps = {
  paramKey: string
  placeholder?: string
  className?: string
  mode?: 'push' | 'replace'
  debounceMs?: number
}

const useSimpleParamInput = ({
  paramKey,
  mode = 'push',
  debounceMs = 500,
}: Pick<SimpleParamInputProps, 'paramKey' | 'mode' | 'debounceMs'>) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const valueFromSearchParams = searchParams.get(paramKey)

  const updateParam = useCallback(
    (value: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      if (value) {
        newSearchParams.set(paramKey, value)
      } else {
        newSearchParams.delete(paramKey)
      }
      router[mode](`${pathname}?${newSearchParams.toString()}`)
    },
    [router, pathname, searchParams, paramKey, mode],
  )

  // Debounce the updateParam function
  const debouncedUpdateParam = useMemo(
    () => debounce(updateParam, debounceMs),
    [updateParam, debounceMs],
  )

  return {
    value: valueFromSearchParams ?? '',
    updateParam: debouncedUpdateParam,
  }
}

export const SimpleParamInput = ({
  paramKey,
  placeholder,
  className,
  mode,
}: SimpleParamInputProps) => {
  const { value: initialValue, updateParam } = useSimpleParamInput({
    paramKey,
    mode,
  })
  const [inputValue, setInputValue] = useState(initialValue)

  useEffect(() => {
    setInputValue(initialValue)
  }, [initialValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    updateParam(newValue)
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn('pe-9', className)}
      />
      {inputValue && (
        <button
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Clear input"
          onClick={() => {
            setInputValue('')
            updateParam('')
          }}
        >
          <CircleX size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
