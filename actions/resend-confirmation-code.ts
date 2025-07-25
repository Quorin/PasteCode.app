'use server'

import { db } from '@/db/db'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '@/db/schema'
import { resendConfirmationCodeSchema } from '@/server/schema'
import { sendConfirmationEmail } from '@/utils/email'
import { generateRandomString } from '@/utils/random'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { waitUntil } from '@vercel/functions'

export const resendConfirmationCode = os
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(resendConfirmationCodeSchema.keyof(), z.string()),
    },
  })
  .input(resendConfirmationCodeSchema)
  .output(z.void())
  .handler(async ({ input: { email }, errors }) => {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        confirmed: usersTable.confirmed,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .execute()

    if (!user) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'Account with this email does not exist. Please sign up.',
        },
      })
    }

    if (user.confirmed) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'Account is already confirmed.',
        },
      })
    }

    const code = generateRandomString(confirmationCodeLength)

    const [confirmation] = await db
      .select({
        id: confirmationCodesTable.id,
        userId: confirmationCodesTable.userId,
        createdAt: confirmationCodesTable.createdAt,
      })
      .from(confirmationCodesTable)
      .where(eq(confirmationCodesTable.userId, user.id))
      .limit(1)
      .execute()

    if (
      confirmation &&
      dayjs().diff(dayjs(confirmation.createdAt), 'minute') < 10
    ) {
      throw errors.BAD_REQUEST({
        data: {
          email:
            'You have to wait 10 minutes before requesting a new confirmation code',
        },
      })
    }

    const expiresAt = dayjs().add(48, 'hours').toDate()

    const [newConfirmation] = await db
      .insert(confirmationCodesTable)
      .values({
        code,
        userId: user.id,
        createdAt: new Date(),
        expiresAt,
      })
      .onConflictDoUpdate({
        set: {
          code,
          expiresAt,
        },
        target: confirmationCodesTable.id,
      })
      .returning({
        id: confirmationCodesTable.id,
      })
      .execute()

    waitUntil(sendConfirmationEmail(email, newConfirmation!.id, code))
  })
  .actionable()
