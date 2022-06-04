# Git Envs

Save encrypted environment variables directly in git.

## Setup

- Create a ts file in your root folder (we suggest `createEnvFiles.ts`)
- Copy the following template into the file:

```ts
import { GenerateEnvVarsFunction, Keys, main } from '@dreamstack/git-envs'

type Stage = 'production' | 'staging' | 'development'

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

export const generateEnvVars: GenerateEnvVarsFunction<Stage> = ({
  resolveSecret,
}) => {
  const files = {
    nextApp: `${__dirname}/apps/next/.env`,
  }

  // Ignore formatting (prettier-ignore) to make it less convoluted. Prettier puts the long strings
  // into an extra line, which is not easily readable.
  return [
    // prettier-ignore
    {
      key: 'ENV_NAME',
      envFiles: [files.nextApp],
      values: {
        default: 'EMPTY',
        production: resolveSecret(''),
        staging: resolveSecret(''),
        development: resolveSecret(''),
      },
    },
  ]
}

main({
  generateEnvVars,
  keys,
})
```

- Setup the stages as you need them
  - `development` is the default stage that is used if you do not specify any stage
- Create new public / private keys for every stage you defined by running `npx ts-node createEnvFiles.ts createKeys` (or how you called your file)
  - Copy the object with `publicKey` & `encryptedPrivateKey` and paste them into the `keys` object in your `createEnvFiles.ts` file
  - !WARNING! Do not copy & paste the passphrase into `createEnvFiles.ts`. It is a secret! Save it into your password manager for now.
- For every .env file you want to create, create an entry in the `file` object.
  - Use those files in your `envFile` array while defining your environment variables
- Add the following command to your `package.json`:
  - `"env:create": "npx ts-node createEnvFiles.ts createEnvFiles"`
  - `"env:ui": "npx nodemon createEnvFiles.ts ui"`
  - `"prepare": "yarn env:create"` (This is so that the .env files will be created after node_modules were installed)
- Add `*.passphrase` to your `.gitignore`

## Adding new environment variables

- Start the UI by running `yarn env:ui` and go to `http://localhost:1337`
- Define environment variables in your `createEnvFiles.ts` file
  - Every variable can be in multiple env files
  - The `default` value will be used if no value for the current stage is provided
  - If you want to use an encrypted enviroment variable go to the UI and enter the plaintext under `Encryption`
  - Copy the encrypted secret and paste it into the `resolveSecret` function. Example: `resolveSecret('jk3Z35gkHKQtWlLWl4HXdhEJQAJdyIHTzQ4nH/uq84+SdD2ty2Q6qEECfjbAr79U65slD+8BxmFbSMwkAFdXtpkJpw+vHzwi+uVbMIDuq/yHW39XQ9Tv+5qGO3xIZnnE1HrkIOYNFc5O+YLb5dsBTasBwbMrVEBSUL1jA7NdL1IHo9lidrMPFfPxTdyB6COfuhu+UBq1MSXvjVabXXYuU2LXCBVeGhfRRVqs9lxPzb0ilplldsxns3nWRc3g2C5mOc3P2Ki9PjPEmaSvAi/CDgtrXuhMQ4yjeTTLmsZ9iDzyC9RR6apoJBj0NMkFxrnoJg/gG9Jyrgofbi2vfgmchFTPNB41KggNFEMGf428oihXW/k0o9tZWkyiCkXyysjHNJ/hz5g10tEBII1DTifWSe4H2LAfvAliOz8EzTMopXnra5LjlP1exDiTBTwg1GQj6VJ0tcYGnDLkGbkHVXZSZxQwgHWyUKcipb3J2O+21qMWcsRPGo4mzH0X6ORKnD+v4oGI34YDvcedMuQEfs2pmmX+EYwQx3TRgNk6Uy3ZAU84nM2z3IFeLBjhra5/mIH68y/MFMN/Kle6lEa28RR3bz2ToMDrDfvEyIQV+T2X0h8YiUDhol6UWA6OPGY8p2xS8Inz/byQCjbPO0z9hk1Vq9nzMkaupAy/KzZcorwtSPc=')`

## Decrypting environment variables locally

- This is for debugging purposes only
- Copy the passphrases you got from the `createKeys` command and paste them into the textarea under `Decryption`
- All secrets will be revealed

## Setting up local dev environment

- You want to give all your developers the development passphrase so that they can work
- You can send them a file called `development.passphrase` which just contains the passphrase
- They should place it under the root folder and the local .env files will be created if they run `env:create` / `yarn install`

## Setting up servers

- On servers you want to provide the passphrase through environment variables. You have to provide two env vars:
- `GITENV_STAGE` defines which stage should be used
- `GITENV_PRIVATE_KEY_PASSPHRASE_${stageName}` contains the passpharse. Replace `${stageName}` with the stage name you used in `GITENV_STAGE`