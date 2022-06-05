import { GenerateEnvVarsFunction } from '../../src/lib/types/GenerateEnvVarsFunction'
import { main } from './../../src/main'
import { keys } from './keys'
import { Stage } from './Stage'

const generateEnvVars: GenerateEnvVarsFunction<Stage> = ({ resolveSecret }) => {
  return []
}

// TODO: Maybe generateEnvVars and keys should be optional for easier setup (generating the keys)
main({
  generateEnvVars,
  keys,
})
