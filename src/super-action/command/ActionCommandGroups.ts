export const DEFAULT_ACTION_COMMAND_GROUP = 'Next Best Action' as const

export const actionCommandGroups = [
  DEFAULT_ACTION_COMMAND_GROUP,
  'Delete',
] as const
export type ActionCommandGroup = (typeof actionCommandGroups)[number]
