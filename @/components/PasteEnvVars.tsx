import dotenv, { type DotenvParseOutput } from 'dotenv'
import { map } from 'lodash-es'
import { useState } from 'react'

export const PasteEnvVars = () => {
  const [envVarsToAdd, setEnvVarsToAdd] = useState<DotenvParseOutput>()

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')

    const result = dotenv.parse(text)
    const hasResults = Object.keys(result).length > 0
    if (!hasResults) return
    event.preventDefault()
    setEnvVarsToAdd(result)
  }

  return envVarsToAdd
    ? map(envVarsToAdd, (value, key) => (
        <div key={key} className="flex w-full">
          <div className="truncate">{key}=</div>
          <div className="flex-1 truncate">{value}</div>
        </div>
      ))
    : null
}
