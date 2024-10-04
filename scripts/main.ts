#!/usr/bin/env node

import { Command } from 'commander'

const program = new Command()

program
  .name('gitenvs')
  .description('Save your env variables in git – encrypted!')

// program
//   .command('createEnvFiles')
//   .description('Creates the env files for the provided envName')
//   .option('--stage <stage>', 'Example: production, staging, development')
//   .option('--passphrase <passphrase>')
//   .option('--passphrasePath <passphrasePath>')
//   .action((localOptions) => console.log(localOptions))

// program
//   .command('createKeys')
//   .description('Creates a public/private key pair')
//   .action(() => createKeys())

// program
//   .command('encrypt')
//   .description('Returns an encrypted value')
//   .requiredOption(
//     '--stage <stage>',
//     'Example: production, staging, development',
//   )
//   .action((localOptions) => encrypt({ ...options, ...localOptions }))

// program
//   .command('ui')
//   .description('Starts a browser UI for easy interaction')
//   .action(() => ui(options))

program.parse()
