export type Keys<Stage extends string> = Record<
  Stage,
  { publicKey: string; encryptedPrivateKey: string }
>
