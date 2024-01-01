import dayjs from 'dayjs'
import { tagsTable, tagsOnPastesTable } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'

type Maybe<T> = T | null | undefined

type Expiration =
  | 'same'
  | 'never'
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | '10m'

export const getExpirationDate = (
  input?: Maybe<Expiration>,
  current?: Maybe<Date>,
): Maybe<Date> => {
  switch (input) {
    case 'year':
      return dayjs().add(1, 'year').toDate()
    case 'month':
      return dayjs().add(1, 'month').toDate()
    case 'week':
      return dayjs().add(1, 'week').toDate()
    case 'day':
      return dayjs().add(1, 'day').toDate()
    case 'hour':
      return dayjs().add(1, 'hour').toDate()
    case '10m':
      return dayjs().add(10, 'minute').toDate()
    case 'same':
      return current ?? null
    default:
      return null
  }
}

export const upsertTagsOnPaste = async (
  db: NeonHttpDatabase<any>,
  inputTags: string[] | undefined,
  pasteId: string,
) => {
  if (inputTags && inputTags.length > 0) {
    inputTags = inputTags.map((tag) => tag.toLowerCase())

    await db
      .insert(tagsTable)
      .values(inputTags.map((tag) => ({ name: tag })))
      .onConflictDoNothing()
      .execute()

    const tags = await db
      .select({
        id: tagsTable.id,
      })
      .from(tagsTable)
      .where(sql`name in ${inputTags}`)
      .execute()

    await db
      .delete(tagsOnPastesTable)
      .where(eq(tagsOnPastesTable.pasteId, pasteId))
      .execute()

    await db
      .insert(tagsOnPastesTable)
      .values(
        tags.map((tag) => ({
          pasteId: pasteId,
          tagId: tag.id,
        })),
      )
      .onConflictDoNothing()
      .execute()
  }
}
