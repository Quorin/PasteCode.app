'use server'

import { and, eq, gte, isNull, or, sql } from 'drizzle-orm'
import { pastesTable, tagsOnPastesTable, tagsTable } from '@/db/schema'
import { verify } from 'argon2'
import Cryptr from 'cryptr'
import { db } from '@/db/db'
import { unstable_cache } from 'next/cache'

export const getPaste = async (id: string, password: string | null = null) =>
  unstable_cache(
    async (id: string, password: string | null = null) => {
      const [paste] = await db
        .select({
          id: pastesTable.id,
          content: pastesTable.content,
          password: pastesTable.password,
          tags: sql<
            string[]
          >`coalesce(array_agg(${tagsTable.name}) filter (where ${tagsTable.name} is not null), '{}')`,
          title: pastesTable.title,
          style: pastesTable.style,
          description: pastesTable.description,
          createdAt: pastesTable.createdAt,
          expiresAt: pastesTable.expiresAt,
          userId: pastesTable.userId,
        })
        .from(pastesTable)
        .where(
          and(
            eq(pastesTable.id, id),
            or(
              isNull(pastesTable.expiresAt),
              gte(pastesTable.expiresAt, sql`now()`),
            ),
          ),
        )
        .leftJoin(tagsOnPastesTable, eq(tagsOnPastesTable.pasteId, id))
        .leftJoin(tagsTable, eq(tagsTable.id, tagsOnPastesTable.tagId))
        .groupBy(pastesTable.id)
        .limit(1)
        .execute()

      if (paste && paste.password) {
        if (password) {
          const valid = await verify(paste.password, password)

          if (valid) {
            return {
              paste: {
                ...paste,
                content: new Cryptr(password).decrypt(paste.content),
              },
              secure: false,
            }
          }
        }

        paste.content = ''
        paste.password = ''

        return { paste, secure: true }
      }

      return { paste, secure: false }
    },
    [`paste:${id}:${password ?? ''}`],
    {
      revalidate: false,
      tags: ['paste', `paste:${id}`],
    },
  )(id, password)
