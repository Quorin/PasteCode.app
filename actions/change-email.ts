'use server'

import { db } from '@/db/db'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  sessionsTable,
  usersTable,
} from '@/db/schema'
import { changeEmailSchema } from '@/server/schema'
import { sendConfirmationEmail } from '@/utils/email'
import { generateRandomString } from '@/utils/random'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { waitUntil } from '@vercel/functions'
import { loggedIn } from './middlewares/logged-in'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/server/auth/config'

export const changeEmail = os
  .use(loggedIn)
  .input(changeEmailSchema)
  .output(z.void())
  .handler(async ({ input: { email }, context: { user } }) => {
    const code = generateRandomString(confirmationCodeLength)

    await db
      .update(usersTable)
      .set({
        email,
        confirmed: false,
      })
      .where(eq(usersTable.id, user.id))
      .execute()

    const [[confirmationCode], _] = await Promise.all([
      db
        .insert(confirmationCodesTable)
        .values({
          code,
          expiresAt: dayjs().add(48, 'hours').toDate(),
          userId: user.id,
        })
        .onConflictDoUpdate({
          set: {
            code,
            expiresAt: dayjs().add(48, 'hours').toDate(),
          },
          target: confirmationCodesTable.id,
        })
        .returning({
          id: confirmationCodesTable.id,
        })
        .execute(),
      db
        .delete(sessionsTable)
        .where(eq(sessionsTable.userId, user.id))
        .execute(),
    ])

    waitUntil(sendConfirmationEmail(email, confirmationCode!.id, code))

    const cookieStore = await cookies()
    cookieStore.delete(sessionOptions.cookieName)
  })
  .actionable()
