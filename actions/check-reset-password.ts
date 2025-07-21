import { db } from '@/db/db'
import { resetPasswordsTable } from '@/db/schema'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export const checkResetPassword = os
  .input(
    z.object({
      id: z.string(),
      code: z.string(),
    }),
  )
  .output(z.boolean())
  .handler(async ({ input: { id, code } }) => {
    const [rp] = await db
      .select({
        id: resetPasswordsTable.id,
        expiresAt: resetPasswordsTable.expiresAt,
      })
      .from(resetPasswordsTable)
      .where(
        and(eq(resetPasswordsTable.id, id), eq(resetPasswordsTable.code, code)),
      )
      .limit(1)
      .execute()

    return !!(rp && dayjs().isBefore(rp.expiresAt))
  })
  .callable()
