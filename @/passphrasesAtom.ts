import { type Passphrase } from '@/gitenvs/gitenvs.schema'
import { atom } from 'jotai'

export const passphrasesAtom = atom<Passphrase[]>([])
