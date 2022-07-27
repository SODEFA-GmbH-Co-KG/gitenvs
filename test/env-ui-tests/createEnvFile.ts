import { GenerateEnvFilesFunction, Keys, main } from '../../src'

type Stage = 'production' | 'staging' | 'development'

const generateEnvFiles: GenerateEnvFilesFunction<Stage> = ({
  resolveSecret,
}) => {
  return [
    {
      envFilePath: 'path/to/your/app/.env.local',
      envVars: [
        {
          key: 'ENV_NAME',
          values: {
            default: 'EMPTY',
            production: resolveSecret(''),
            staging: resolveSecret(''),
            development: resolveSecret(''),
          },
        },
      ],
    },
  ]
}

const keys: Keys<Stage> = {
  production: {
    publicKey: '',
    encryptedPrivateKey: '',
  },
  staging: {
    publicKey: '',
    encryptedPrivateKey: '',
  },
  development: {
    publicKey: '',
    encryptedPrivateKey: '',
  },
}

main({
  generateEnvFiles,
  keys,
})
