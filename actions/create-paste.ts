'use server'

import { db } from '@/db/db'
import { pastesTable } from '@/db/schema'
import { createPasteSchema } from '@/server/schema'
import { getExpirationDate } from '@/utils/paste'
import { os } from '@orpc/server'
import { hash } from 'argon2'
import Cryptr from 'cryptr'
import { z } from 'zod'
import { upsertTags } from './shared/upsert-tags'
import { getUser } from './shared/get-user'

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
      const user = await getUser()

      const [paste] = await db
        .insert(pastesTable)
        .values({
          title,
          content: password ? new Cryptr(password).encrypt(content) : content,
          style,
          description,
          expiresAt: getExpirationDate(expiration),
          password: password ? await hash(password) : null,
          userId: user?.id ?? null,
        })
        .returning({
          id: pastesTable.id,
        })
        .execute()

      await upsertTags(db, tags, paste!.id)

      return {
        id: paste!.id,
      }
    },
  )
  .actionable()
