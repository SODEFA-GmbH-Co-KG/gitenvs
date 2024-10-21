export const getPassphraseEnvName = ({ stage }: { stage: string }) =>
  `GITENVS_PASSPHRASE_${stage?.toUpperCase()}`

export const GITENVS_STAGE_ENV_NAME = 'GITENVS_STAGE'

export const GITENVS_DIR_ENV_NAME = 'GITENVS_DIR'

export const GITENVS_ENCRYPTION_TOKEN_ENV_NAME = 'GITENVS_ENCRYPTION_TOKEN'
