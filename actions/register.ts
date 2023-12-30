'use server'

import { ZodError, ZodIssue, z } from 'zod'
import { registerSchema } from '@/server/schema'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '@/db/schema'
import { eq, or } from 'drizzle-orm'
import { generateRandomString } from '@/utils/random'
import { hash } from 'argon2'
import dayjs from 'dayjs'
import { sendConfirmationEmail } from '@/utils/email'
import { db } from '@/db/db'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/errorHandler'

export const registerAction = async <
  TInput extends z.infer<typeof registerSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const validation = registerSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { email, name, password } = validation.data

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
    })
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.name, name)))
    .limit(1)
    .execute()

  if (user) {
    let errors: ZodIssue[] = []

    if (user.email === email) {
      errors.push({
        message: 'Provided email is already in use',
        path: ['email'],
        code: 'custom',
      })
    }

    if (user.name === name) {
      errors.push({
        message: 'Provided name is already in use',
        path: ['name'],
        code: 'custom',
      })
    }

    return validationErrorResult(new ZodError(errors))
  }

  const code = generateRandomString(confirmationCodeLength)

  const [createdUser] = await db
    .insert(usersTable)
    .values({
      email,
      name,
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

  await sendConfirmationEmail(email, confirmationCode!.id, code)

  return successResult(undefined)
}
