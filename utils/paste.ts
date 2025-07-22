import type { Expiration } from '@/server/schema'
import dayjs from 'dayjs'

type Maybe<T> = T | null | undefined

export const getExpirationDate = (
  input?: Maybe<Expiration>,
  current?: Maybe<Date>,
) => {
  switch (input) {
    case 'year':
    case 'month':
    case 'week':
    case 'day':
    case 'hour':
      return dayjs().add(1, input).toDate()
    case '10m':
      return dayjs().add(10, 'minute').toDate()
    case 'same':
      return current ?? null
    default:
      return null
  }
}
