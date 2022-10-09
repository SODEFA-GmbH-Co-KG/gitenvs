# Design Ideas

## EnvVar

- If a `pointer` exists `value` must be empty (because we point to somewhere else)
- If a `funcName` exists
  - `value` can be set or it can be empty. If `value` is set
    - it can be plain or encrypted
    - it can contain a simple string or it could hold a stringified JSON that will be parsed and send to the function as `input`
  - a `pointer` can exists, too. The function gets the `value` of the pointer as `input`
- Resolving an `EnvVar`
  - Check if there is an `pointer` and resolve that EnvVar
    - Else use the `value` of the current `EnvVar` (encrypt it if needed)
  - Check if there is a `funcName` and use the result from the previous step as an `input`
  - Copy the result to `_valueResolved`
