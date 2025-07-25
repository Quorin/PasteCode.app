'use server'

import { db } from '@/db/db'
import { resetPasswordSchema } from '@/server/schema'
import {
  confirmationCodeLength,
  resetPasswordsTable,
  usersTable,
} from '@/db/schema'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { generateRandomString } from '@/utils/random'
import { sendResetPasswordEmail } from '@/utils/email'
import { z } from 'zod'
import { waitUntil } from '@vercel/functions'

export const resetPassword = os
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(resetPasswordSchema.keyof(), z.string()),
    },
  })
  .input(resetPasswordSchema)
  .output(z.void())
  .handler(async ({ input: { email }, errors }) => {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        resetPassword: {
          id: resetPasswordsTable.id,
          code: resetPasswordsTable.code,
          expiresAt: resetPasswordsTable.expiresAt,
        },
      })
      .from(usersTable)
      .leftJoin(
        resetPasswordsTable,
        eq(resetPasswordsTable.userId, usersTable.id),
      )
      .where(eq(usersTable.email, email))
      .limit(1)
      .execute()

    if (!user) {
      return
    }

    if (user.resetPassword && user.resetPassword.expiresAt > new Date()) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'You need to wait few minutes for another try',
        },
      })
    }

    const code = generateRandomString(confirmationCodeLength)
    const expiresAt = dayjs().add(10, 'minute').toDate()

    const [rp] = await db
      .insert(resetPasswordsTable)
      .values({
        code,
        expiresAt,
        userId: user.id,
      })
      .onConflictDoUpdate({
        set: {
          code,
          expiresAt,
        },
        target: resetPasswordsTable.id,
      })
      .returning({
        id: resetPasswordsTable.id,
      })
      .execute()

    waitUntil(sendResetPasswordEmail(email, rp!.id, code))
  })
  .actionable()
