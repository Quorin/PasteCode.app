'use server'

import { db } from '@/db/db'
import { pastesTable } from '@/db/schema'
import { removePasteSchema } from '@/server/schema'
import { os } from '@orpc/server'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { forbidden, notFound } from 'next/navigation'
import { loggedIn } from './middlewares/logged-in'

export const removePaste = os
  .use(loggedIn)
  .input(removePasteSchema)
  .output(z.void())
  .handler(
    async ({
      input: { id, password },
      context: {
        user: { id: userId },
      },
    }) => {
      const [paste] = await db
        .select({
          id: pastesTable.id,
          userId: pastesTable.userId,
          password: pastesTable.password,
        })
        .from(pastesTable)
        .where(eq(pastesTable.id, id))
        .limit(1)
        .execute()

      if (!paste) {
        notFound()
      }

      if (paste.userId !== userId) {
        forbidden()
      }

      if (
        paste.password &&
        (!password || !(await verify(paste.password, password)))
      ) {
        forbidden()
      }

      await db.delete(pastesTable).where(eq(pastesTable.id, id)).execute()
    },
  )
  .actionable()
