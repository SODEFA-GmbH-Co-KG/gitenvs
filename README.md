# Gitenvs

Save your environment variables in git – encrypted.

<img src="docs/images/app.jpg" style="border-radius: 8px;" alt="App screenshot">

## Why?

- **Consistency**: You can easily share your environment variables with your team. Run `git pull main` and you have the latest environment variables.
- **Encrypted**: Your environment variables are encrypted and securely stored in your repository.
- **Branch-specific environments**: Maintain different environment variables per (feature-) branch and automatically apply them when merging, eliminating manual configuration in production.
- **Multi-stage environments**: Maintain separate environment variables for development, staging, and production environments.
- **Access Control**: Developers only have access to development environment variables through a development-specific encryption passphrase. Without the staging/production passphrases, they cannot decrypt or modify environment variables for those environments, ensuring proper access control.

## How?

Just run 

```bash
npx gitenvs@latest
```

A UI is automatically opened in your browser. Run through the wizard to set up gitenvs.

## Features

- **Multi env file support**: Useful for monorepos with different apps and different environments.
- **Link env vars between files**: Link env vars between files. Useful if you have a shared env var in a monorepo.
- **Import from .env**: Import existing .env files through the wizard or paste .env file contents directly in the environment variable overview.
- **Decrypt env vars in the UI** to check the content. Can be toggled per stage.
- **Import existing env vars**: Import from .env files in your project folder or from vercel.