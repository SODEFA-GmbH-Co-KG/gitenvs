import { program } from 'commander'
import { createEnvFiles } from './commands/createEnvFiles'
import { createKeys } from './commands/createKeys'
import { encrypt } from './commands/encrypt'
import { ui } from './commands/ui/ui'
import { GenerateEnvVarsFunction } from './lib/types/GenerateEnvVarsFunction'
import { Keys } from './lib/types/Keys'

export type MainOptions<Stage extends string> = {
  generateEnvVars: GenerateEnvVarsFunction<Stage>
  keys: Keys<Stage>
}

export const main = <Stage extends string>(options: MainOptions<Stage>) => {
  program
    .name('gitEnvs')
    .description('Save your env variables in git – encrypted!')

  program
    .command('createEnvFiles')
    .description('Creates the env files for the provided envName')
    .option('--stage <stage>', 'Example: production, staging, development')
    .option('--passphrase <passphrase>')
    .option('--passphrasePath <passphrasePath>')
    .action((localOptions) => createEnvFiles({ ...options, ...localOptions }))

  program
    .command('createKeys')
    .description('Creates a public/private key pair')
    .action(() => createKeys())

  program
    .command('encrypt')
    .description('Returns an encrypted value')
    .requiredOption(
      '--stage <stage>',
      'Example: production, staging, development',
    )
    .action((localOptions) => encrypt({ ...options, ...localOptions }))

  program
    .command('ui')
    .description('Starts a browser UI for easy interaction')
    .action(() => ui(options))

  program.parse()
}
