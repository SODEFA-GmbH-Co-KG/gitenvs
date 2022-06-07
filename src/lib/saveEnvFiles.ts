import { writeFile } from 'fs/promises'
import { filter, map } from 'lodash'
import { ProcessedEnvFile } from './types/EnvFile'

export const saveEnvFiles = async ({
  envFiles,
}: {
  envFiles: ProcessedEnvFile[]
}) => {
  await Promise.all(
    map(envFiles, async ({ envFilePath, envVars }) => {
      const cleanedEnvVars = filter(envVars, (envVar) => !!envVar.value)
      const fileContent = map(cleanedEnvVars, ({ key, value }) => {
        console.log(`🔧 🔑 Writing ${key} to ${envFilePath}`)
        return `${key}=${value}`
      }).join('\n')
      await writeFile(envFilePath, fileContent)
      console.log(`🔧 📄 ${envFilePath} created`)
    }),
  )
}
