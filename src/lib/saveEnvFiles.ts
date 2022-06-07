import { writeFile } from 'fs/promises'
import { filter, map } from 'lodash'
import { ProcessedEnvFile, ProcessedEnvVar } from './types/EnvFile'

const getDotEnvFileContent = ({
  envVars,
  envFilePath,
}: {
  envVars: ProcessedEnvVar[]
  envFilePath: string
}) => {
  const fileContent = map(envVars, ({ key, value }) => {
    console.log(`🔧 🔑 Writing ${key} to ${envFilePath}`)
    return `${key}=${value}`
  }).join('\n')

  return fileContent
}

const getTsEnvFileContent = ({
  envVars,
  envFilePath,
}: {
  envVars: ProcessedEnvVar[]
  envFilePath: string
}) => {
  const fileContent = map(envVars, ({ key, value }) => {
    console.log(`🔧 🔑 Writing ${key} to ${envFilePath}`)
    return `export const ${key} = '${value}'`
  }).join('\n')

  return fileContent
}

const getFileContent = ({
  envVars,
  envFilePath,
  envType,
}: ProcessedEnvFile) => {
  const cleanedEnvVars = filter(envVars, (envVar) => !!envVar.value)

  switch (envType) {
    case 'ts':
      return getTsEnvFileContent({
        envVars: cleanedEnvVars,
        envFilePath,
      })
    case 'dotenv':
    default:
      return getDotEnvFileContent({
        envVars: cleanedEnvVars,
        envFilePath,
      })
  }
}

export const saveEnvFiles = async ({
  envFiles,
}: {
  envFiles: ProcessedEnvFile[]
}) => {
  await Promise.all(
    map(envFiles, async (envFile) => {
      const { envFilePath } = envFile
      const fileContent = getFileContent(envFile)
      await writeFile(envFilePath, fileContent)
      console.log(`🔧 📄 ${envFilePath} created`)
    }),
  )
}
