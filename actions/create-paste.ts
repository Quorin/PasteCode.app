'use server'

import { db } from '@/db/db'
import { pastesTable } from '@/db/schema'
import { createPasteSchema } from '@/server/schema'
import { getSession } from '@/utils/auth'
import { getExpirationDate, upsertTagsOnPaste } from '@/utils/paste'
import { os } from '@orpc/server'
import { hash } from 'argon2'
import Cryptr from 'cryptr'
import { z } from 'zod'

export const createPaste = os
  .input(createPasteSchema)
  .output(
    z.object({
      id: z.string(),
    }),
  )
  .handler(
    async ({
      input: { title, content, style, description, expiration, password, tags },
    }) => {
      const session = await getSession()

      const [paste] = await db
        .insert(pastesTable)
        .values({
          title,
          content: password ? new Cryptr(password).encrypt(content) : content,
          style,
          description,
          expiresAt: getExpirationDate(expiration),
          password: password ? await hash(password) : null,
          userId: session?.user?.id ?? null,
        })
        .returning({
          id: pastesTable.id,
        })
        .execute()

      await upsertTagsOnPaste(db, tags, paste!.id)

      return {
        id: paste!.id,
      }
    },
  )
  .actionable()
