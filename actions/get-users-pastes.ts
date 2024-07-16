'use server'

import { and, asc, desc, eq, gte, isNull, or, sql } from 'drizzle-orm'
import { db } from '@/db/db'
import { pastesTable, tagsOnPastesTable, tagsTable } from '@/db/schema'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'
import type { PastesSortBy } from '@/server/schema'

const metaQuery = db
  .select({
    count: sql<number>`count(*)`,
  })
  .from(pastesTable)
  .where(
    and(
      eq(pastesTable.userId, sql.placeholder('userId')),
      or(
        isNull(pastesTable.expiresAt),
        gte(pastesTable.expiresAt, sql.placeholder('now')),
      ),
    ),
  )
  .limit(1)
  .prepare('pastesMetaQuery')

export const getUsersPastes = async (
  page: number,
  perPage: number,
  sort: PastesSortBy,
) => {
  const { user } = await getSession()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  if (page < 1) {
    page = 1
  }

  if (perPage < 1) {
    perPage = 20
  }

  if (perPage > 200) {
    perPage = 200
  }

  const now = new Date()

  let sortOperator = desc(pastesTable.createdAt)
  switch (sort) {
    case 'createdAt.asc':
      sortOperator = asc(pastesTable.createdAt)
      break
    case 'expiresAt.asc':
      sortOperator = asc(pastesTable.expiresAt)
      break
    case 'expiresAt.desc':
      sortOperator = desc(pastesTable.expiresAt)
      break
    case 'title.asc':
      sortOperator = asc(pastesTable.title)
      break
    case 'title.desc':
      sortOperator = desc(pastesTable.title)
      break
    default:
      break
  }

  const [meta, pastes] = await Promise.all([
    metaQuery.execute({
      userId: user.id,
      perPage,
      now,
    }),
    db
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
          or(isNull(pastesTable.expiresAt), gte(pastesTable.expiresAt, now)),
        ),
      )
      .leftJoin(
        tagsOnPastesTable,
        eq(tagsOnPastesTable.pasteId, pastesTable.id),
      )
      .leftJoin(tagsTable, eq(tagsTable.id, tagsOnPastesTable.tagId))
      .orderBy(sortOperator)
      .groupBy(pastesTable.id)
      .offset((page - 1) * perPage)
      .limit(perPage)
      .execute(),
  ])

  return {
    pastes,
    meta: {
      pageCount: Math.ceil((meta[0]?.count ?? 0) / perPage),
      page,
    },
  }
}
