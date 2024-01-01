'use server'

import dayjs from 'dayjs'
import {
  confirmationCodeLength,
  resetPasswordsTable,
  usersTable,
} from '@/db/schema'
import { resetPasswordSchema } from '@/server/schema'
import { sendResetPasswordEmail } from '@/utils/email'
import { generateRandomString } from '@/utils/random'
import { ZodError, z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db/db'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'

export const resetPasswordAction = async <
  TInput extends z.infer<typeof resetPasswordSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const validation = resetPasswordSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { email } = validation.data

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
    return validationErrorResult(
      new ZodError([
        {
          path: ['email'],
          message: 'You need to wait few minutes for another try',
          code: 'custom',
        },
      ]),
    )
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

  await sendResetPasswordEmail(email, rp!.id, code)

  return successResult(undefined)
}
