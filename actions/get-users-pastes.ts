'use server'

import { and, desc, eq, gt, gte, isNull, or, sql } from 'drizzle-orm'
import { db } from '@/db/db'
import { pastesTable, tagsOnPastesTable, tagsTable } from '@/db/schema'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'

export const getUsersPastes = async (limit?: number, cursor?: string) => {
  limit = limit ?? 50

  const { user } = await getSession()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  const pastes = await db
    .select({
      id: pastesTable.id,
      createdAt: pastesTable.createdAt,
      expiresAt: pastesTable.expiresAt,
      tags: sql<
        string[]
      >`coalesce(array_agg(${tagsTable.name}) filter (where ${tagsTable.name} is not null), '{}')`,

      title: pastesTable.title,
      description: pastesTable.description,
    })
    .from(pastesTable)
    .where(
      and(
        eq(pastesTable.userId, user.id),
        or(
          isNull(pastesTable.expiresAt),
          gte(pastesTable.expiresAt, sql`now()`),
        ),
        cursor ? gt(pastesTable.id, cursor) : undefined,
      ),
    )
    .leftJoin(tagsOnPastesTable, eq(tagsOnPastesTable.pasteId, pastesTable.id))
    .leftJoin(tagsTable, eq(tagsTable.id, tagsOnPastesTable.tagId))
    .orderBy(desc(pastesTable.createdAt))
    .groupBy(pastesTable.id)
    .limit(limit + 1)
    .execute()

  let nextCursor: typeof cursor | null = null

  if (pastes.length > limit) {
    const nextItem = pastes.pop()
    nextCursor = nextItem!.id
  }

  return { pastes, nextCursor }
}
