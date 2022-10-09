# Design Ideas

## Functions

- If you have a `func` you can't have a `pointer` or a `value`. But you get `params` that can contain multiple `pointer` or a `value`
- With this configuration the following examples are possible
  - `getIPAddr`: Return the current IP address. Does not depend on `params`
  - `getJWTSecretForHasura`: Hasura needs the secret with more information. `params` would be:
    ```json
    {
      "jwtSecret": [{"type": "pointer", "fileId"...}],
    }
    ```
  - `joinEnvVars`: Gets a list of env files and joins them with a user defined symbol. Useful for something like: `API_KEYS=[multiple_api_keys_comma_separated_that_are_used_in_other_env_vars_too]`. `params` would be:
    ```json
    {
      "envVarsToJoin": [{"type": "pointer", "fileId"...}],
      "separator": { "type": "value", "value": ",", "encrypted": false }
    }
    ```

## TODO:

'- Make EnvFile type extensible & overwriteable