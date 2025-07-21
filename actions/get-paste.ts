import { db } from '@/db/db'
import { pastesTable, tagsOnPastesTable, tagsTable } from '@/db/schema'
import { os } from '@orpc/server'
import { verify } from 'argon2'
import Cryptr from 'cryptr'
import { and, eq, gte, isNull, or, sql } from 'drizzle-orm'
import { z } from 'zod'

export const getPaste = os
  .input(
    z.object({
      id: z.string(),
      password: z.string().nullable(),
    }),
  )
  .output(
    z.object({
      paste: z
        .object({
          id: z.string(),
          content: z.string(),
          password: z.string().nullable(),
          tags: z.array(z.string()),
          title: z.string(),
          style: z.string().nullable(),
          description: z.string().nullable(),
          createdAt: z.date(),
          expiresAt: z.date().nullable(),
          userId: z.string().nullable(),
        })
        .optional(),
      secure: z.boolean(),
    }),
  )
  .handler(async ({ input: { id, password } }) => {
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
  })
  .callable()
