'use server'

import { and, eq, gte, isNull, or, sql } from 'drizzle-orm'
import { pastesTable, tagsOnPastesTable, tagsTable } from '@/db/schema'
import { verify } from 'argon2'
import Cryptr from 'cryptr'
import { db } from '@/db/db'
import { codeToHtml } from 'shiki'

const generateHtml = async ({
  code,
  style,
}: {
  code: string
  style: string
}) => {
  return codeToHtml(code, {
    lang: style ?? 'txt',
    theme: 'material-theme-darker',
  })
}

export const getPaste = async (id: string, password: string | null = null) => {
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
            content: await generateHtml({
              code: new Cryptr(password).decrypt(paste.content),
              style: paste.style ?? '',
            }),
          },
          secure: false,
        }
      }
    }

    paste.content = ''
    paste.password = ''

    return { paste, secure: true }
  }

  if (paste) {
    return {
      secure: false,
      paste: {
        ...paste,
        content: await generateHtml({
          code: paste.content,
          style: paste.style ?? '',
        }),
      },
    }
  }

  return { paste, secure: false }
}
