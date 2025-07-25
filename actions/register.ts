'use server'

import { db } from '@/db/db'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '@/db/schema'
import { registerSchema } from '@/server/schema'
import { sendConfirmationEmail } from '@/utils/email'
import { generateRandomString } from '@/utils/random'
import { os } from '@orpc/server'
import { hash } from 'argon2'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { waitUntil } from '@vercel/functions'

export const register = os
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(registerSchema.keyof(), z.string()),
    },
  })
  .input(registerSchema)
  .output(z.void())
  .handler(async ({ input: { email, password }, errors }) => {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .execute()

    if (user) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'Provided email is already in use',
        },
      })
    }

    const code = generateRandomString(confirmationCodeLength)

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        email,
        password: await hash(password),
        acceptTerms: true,
        confirmed: false,
      })
      .returning({
        id: usersTable.id,
      })
      .execute()

    const [confirmationCode] = await db
      .insert(confirmationCodesTable)
      .values({
        code,
        userId: createdUser!.id,
        createdAt: new Date(),
        expiresAt: dayjs().add(48, 'hours').toDate(),
      })
      .returning({
        id: confirmationCodesTable.id,
      })
      .execute()

    waitUntil(sendConfirmationEmail(email, confirmationCode!.id, code))
  })
  .actionable()
