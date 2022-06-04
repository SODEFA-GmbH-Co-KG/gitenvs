import { writeFile } from 'fs/promises'
import { filter, groupBy, map } from 'lodash'

export const saveEnvVars = async ({
  envVars,
}: {
  envVars: {
    value: string | undefined
    envFile: string
    key: string
  }[]
}) => {
  const cleanedEnvVars = filter(envVars, (config) => !!config.value)
  const envVarsByFile = Object.entries(
    groupBy(cleanedEnvVars, (config) => config.envFile)
  )
  await Promise.all(
    map(envVarsByFile, async ([envFile, envVars]) => {
      const fileContent = map(envVars, ({ key, value }) => {
        console.log(`🔧 🔑 Writing ${key} to ${envFile}`)
        return `${key}=${value}`
      }).join('\n')
      await writeFile(envFile, fileContent)
      console.log(`🔧 📄 ${envFile} created`)
    })
  )
}
