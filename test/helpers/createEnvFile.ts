import { GenerateEnvFilesFunction } from '../../src'
import { main } from './../../src/main'
import { keys } from './keys'
import { Stage } from './Stage'

const generateEnvFiles: GenerateEnvFilesFunction<Stage> = ({
  resolveSecret,
}) => {
  return []
}

// TODO: Maybe generateEnvFiles and keys should be optional for easier setup (generating the keys)
main({
  generateEnvFiles,
  keys,
})
