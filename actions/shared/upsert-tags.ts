import type { DB } from '@/db/db'
import { tagsOnPastesTable } from '@/db/schema'

import { tagsTable } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export const upsertTags = async (
  db: DB,
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
