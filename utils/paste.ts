import type { Expiration } from '@/server/schema'
import dayjs from 'dayjs'

type Maybe<T> = T | null | undefined

export const getExpirationDate = (
  input?: Maybe<Expiration>,
  current?: Maybe<Date>,
) => {
  switch (input) {
    case 'year':
      return dayjs().add(1, input).toDate()
    case 'same':
      return current ?? null
    default:
      return null
  }
}
