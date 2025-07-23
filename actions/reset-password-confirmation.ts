'use server'

import { and, eq } from 'drizzle-orm'
import { resetPasswordsTable, usersTable } from '@/db/schema'
import { resetPasswordConfirmationSchema } from '@/server/schema'
import { hash } from 'argon2'
import { z } from 'zod'
import dayjs from 'dayjs'
import { db } from '@/db/db'
import { os } from '@orpc/server'

export const resetPasswordConfirmation = os
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(
        resetPasswordConfirmationSchema.keyof(),
        z.string(),
      ),
    },
  })
  .input(resetPasswordConfirmationSchema)
  .output(z.void())
  .handler(async ({ input: { password, code, id }, errors }) => {
    const [rp] = await db
      .select({
        id: resetPasswordsTable.id,
        userId: resetPasswordsTable.userId,
        code: resetPasswordsTable.code,
        expiresAt: resetPasswordsTable.expiresAt,
        user: {
          id: usersTable.id,
        },
      })
      .from(resetPasswordsTable)
      .innerJoin(usersTable, eq(usersTable.id, resetPasswordsTable.userId))
      .where(
        and(eq(resetPasswordsTable.id, id), eq(resetPasswordsTable.code, code)),
      )
      .limit(1)
      .execute()

    if (!rp || dayjs().isAfter(rp.expiresAt)) {
      throw errors.BAD_REQUEST({
        data: {
          password: 'Code is incorrect or expired',
        },
      })
    }

    await db
      .update(usersTable)
      .set({
        password: await hash(password),
      })
      .where(eq(usersTable.id, rp.userId))
      .execute()

    await db
      .delete(resetPasswordsTable)
      .where(eq(resetPasswordsTable.id, rp.id))
      .execute()
  })
  .actionable()
