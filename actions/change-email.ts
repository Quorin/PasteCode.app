'use server'

import { db } from '@/db/db'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '@/db/schema'
import { changeEmailSchema } from '@/server/schema'
import { sendConfirmationEmail } from '@/utils/email'
import { generateRandomString } from '@/utils/random'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { loggedIn } from './middlewares/logged-in'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/server/auth/config'

export const changeEmail = os
  .use(loggedIn)
  .input(changeEmailSchema)
  .output(z.void())
  .handler(async ({ input: { email }, context: { session } }) => {
    const code = generateRandomString(confirmationCodeLength)

    await db
      .update(usersTable)
      .set({
        email,
        confirmed: false,
        credentialsUpdatedAt: new Date(),
      })
      .where(eq(usersTable.id, session.user.id))
      .execute()

    const [confirmationCode] = await db
      .insert(confirmationCodesTable)
      .values({
        code,
        expiresAt: dayjs().add(48, 'hours').toDate(),
        userId: session.user.id,
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
      .execute()

    await sendConfirmationEmail(email, confirmationCode!.id, code)

    const cookieStore = await cookies()
    cookieStore.delete(sessionOptions.cookieName)
  })
  .actionable()
