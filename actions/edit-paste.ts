'use server'

import { db } from '@/db/db'
import { pastesTable } from '@/db/schema'
import { updatePasteSchema } from '@/server/schema'
import { getExpirationDate } from '@/utils/paste'
import { os } from '@orpc/server'
import { hash, verify } from 'argon2'
import Cryptr from 'cryptr'
import { eq } from 'drizzle-orm'
import { forbidden, notFound } from 'next/navigation'
import { z } from 'zod'
import { loggedIn } from './middlewares/logged-in'
import { upsertTags } from './shared/upsert-tags'

export const editPaste = os
  .use(loggedIn)
  .input(updatePasteSchema)
  .output(z.void())
  .handler(
    async ({
      input: {
        id,
        title,
        content,
        style,
        description,
        expiration,
        password,
        currentPassword,
        tags,
      },
      context: {
        session: { user },
      },
    }) => {
      const [paste] = await db
        .select({
          id: pastesTable.id,
          userId: pastesTable.userId,
          password: pastesTable.password,
          expiresAt: pastesTable.expiresAt,
        })
        .from(pastesTable)
        .where(eq(pastesTable.id, id))
        .limit(1)
        .execute()

      if (!paste) {
        notFound()
      }

      if (paste.userId !== user.id) {
        forbidden()
      }

      if (paste.password) {
        if (!currentPassword) {
          forbidden()
        }

        const valid = await verify(paste.password, currentPassword)
        if (!valid) {
          forbidden()
        }
      }

      await db
        .update(pastesTable)
        .set({
          title,
          content: password ? new Cryptr(password).encrypt(content) : content,
          style,
          description,
          expiresAt: getExpirationDate(
            expiration,
            paste.expiresAt ? new Date(paste.expiresAt) : null,
          ),
          password: password ? await hash(password) : null,
        })
        .where(eq(pastesTable.id, id))
        .execute()

      await upsertTags(db, tags, id)
    },
  )
  .actionable()
