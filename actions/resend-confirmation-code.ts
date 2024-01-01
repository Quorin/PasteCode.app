'use server'

import { ZodError, z } from 'zod'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '@/db/schema'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { sendConfirmationEmail } from '@/utils/email'
import { generateRandomString } from '@/utils/random'
import { db } from '@/db/db'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'

const resendInput = z.object({
  email: z.string().email('Invalid email'),
})

export const resendConfirmationCodeAction = async <
  TInput extends z.infer<typeof resendInput>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const validation = resendInput.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { email } = validation.data

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
    return validationErrorResult(
      new ZodError([
        {
          path: ['email'],
          message: 'Account with this email does not exist. Please sign up.',
          code: 'custom',
        },
      ]),
    )
  }

  if (user.confirmed) {
    return validationErrorResult(
      new ZodError([
        {
          path: ['email'],
          message: 'Account is already confirmed. Please sign in.',
          code: 'custom',
        },
      ]),
    )
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
    return validationErrorResult(
      new ZodError([
        {
          path: ['email'],
          message:
            'You have to wait 10 minutes before requesting a new confirmation code',
          code: 'custom',
        },
      ]),
    )
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

  await sendConfirmationEmail(email, newConfirmation!.id, code)

  return successResult(undefined)
}
