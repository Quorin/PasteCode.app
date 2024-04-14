'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { loginSchema } from '@/server/schema'
import { ZodError, z } from 'zod'
import { verify } from 'argon2'
import { db } from '@/db/db'
import { getSession } from '@/utils/auth'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'

export const loginAction = async <TInput extends z.infer<typeof loginSchema>>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const session = await getSession()

  const validation = loginSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { email, password } = validation.data

  const [user] = await db
    .select({
      id: usersTable.id,
      confirmed: usersTable.confirmed,
      email: usersTable.email,
      password: usersTable.password,
      credentialsUpdatedAt: usersTable.credentialsUpdatedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1)
    .execute()

  if (!user) {
    return validationErrorResult(
      new ZodError([
        {
          path: ['password'],
          message: 'Invalid email or password.',
          code: 'custom',
        },
        {
          path: ['email'],
          message: 'Invalid email or password.',
          code: 'custom',
        },
      ]),
    )
  }

  if (!user?.confirmed) {
    return validationErrorResult(
      new ZodError([
        {
          code: 'custom',
          message: 'Email is not confirmed',
          path: ['email'],
        },
      ]),
    )
  }

  if (!(await verify(user.password ?? '', password))) {
    return validationErrorResult(
      new ZodError([
        {
          message: 'Invalid email or password.',
          path: ['password'],
          code: 'custom',
        },
        {
          path: ['email'],
          message: 'Invalid email or password.',
          code: 'custom',
        },
      ]),
    )
  }

  if (session) {
    session.user = {
      id: user.id,
      credentialsUpdatedAt: user.credentialsUpdatedAt,
    }

    await session.save()
  }

  return successResult(undefined)
}
