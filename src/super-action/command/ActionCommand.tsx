import { ActionCommandClient } from './ActionCommandClient'
import { type ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommand = <Result,>({
  children,
  ...command
}: ActionCommandConfig<Result>) => {
  return <ActionCommandClient {...command}>{children}</ActionCommandClient>
}
