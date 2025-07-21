'use server'

import { db } from '@/db/db'
import { confirmationCodesTable, usersTable } from '@/db/schema'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'
import z from 'zod'

export const confirmAccount = os
  .errors({
    BAD_REQUEST: {
      data: z.void(),
    },
  })
  .input(
    z.object({
      id: z.string(),
      code: z.string(),
    }),
  )
  .output(z.void())
  .handler(async ({ input: { id, code }, errors }) => {
    const [confirmation] = await db
      .select({
        id: confirmationCodesTable.id,
        expiresAt: confirmationCodesTable.expiresAt,
        userId: confirmationCodesTable.userId,
      })
      .from(confirmationCodesTable)
      .where(
        and(
          eq(confirmationCodesTable.id, id),
          eq(confirmationCodesTable.code, code),
        ),
      )
      .limit(1)
      .execute()

    if (!confirmation || dayjs().isAfter(confirmation.expiresAt)) {
      throw errors.BAD_REQUEST()
    }

    await db
      .update(usersTable)
      .set({
        confirmed: true,
      })
      .where(eq(usersTable.id, confirmation.userId))
      .execute()

    await db
      .delete(confirmationCodesTable)
      .where(eq(confirmationCodesTable.id, confirmation.id))
      .execute()
  })
  .actionable()
