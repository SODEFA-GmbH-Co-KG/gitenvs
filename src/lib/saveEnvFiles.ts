import { writeFile } from 'fs/promises'
import { filter, map } from 'lodash'
import { ProcessedEnvFile } from './types/EnvVars'

export const saveEnvFiles = async ({
  envFiles,
}: {
  envFiles: ProcessedEnvFile[]
}) => {
  await Promise.all(
    map(envFiles, async ({ envFile, envVars }) => {
      const cleanedEnvVars = filter(envVars, (envVar) => !!envVar.value)
      const fileContent = map(cleanedEnvVars, ({ key, value }) => {
        console.log(`🔧 🔑 Writing ${key} to ${envFile}`)
        return `${key}=${value}`
      }).join('\n')
      await writeFile(envFile, fileContent)
      console.log(`🔧 📄 ${envFile} created`)
    }),
  )
}
