import { db } from '@/db/db'
import { pastesTable, tagsOnPastesTable, tagsTable } from '@/db/schema'
import { pastesSortBySchema } from '@/server/schema'
import { os } from '@orpc/server'
import { eq, isNull, or, sql, desc, gte, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { loggedIn } from './middlewares/logged-in'

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

export const getUserPastes = os
  .use(loggedIn)
  .input(
    z.object({
      page: z.number(),
      perPage: z.number(),
      sort: pastesSortBySchema.catch('createdAt.desc'),
    }),
  )
  .output(
    z.object({
      pastes: z.array(
        z.object({
          id: z.string(),
          createdAt: z.date(),
          expiresAt: z.date().nullable(),
          title: z.string(),
          description: z.string().nullable(),
          tags: z.array(z.string()),
        }),
      ),
      meta: z.object({
        pageCount: z.number(),
        page: z.number(),
      }),
    }),
  )
  .handler(
    async ({
      context: {
        session: { user },
      },
      input: { page, perPage, sort },
    }) => {
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
              or(
                isNull(pastesTable.expiresAt),
                gte(pastesTable.expiresAt, now),
              ),
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
    },
  )
  .callable()
