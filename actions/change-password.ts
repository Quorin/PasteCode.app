'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { changePasswordSchema } from '@/server/schema'
import { hash, verify } from 'argon2'
import { ZodError, z } from 'zod'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'
import { db } from '@/db/db'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'

export const changePasswordAction = async <
  TInput extends z.infer<typeof changePasswordSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const session = await getSession()

  if (!session.user) {
    redirect(routes.AUTH.LOGIN)
  }

  const validation = changePasswordSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { password, currentPassword } = validation.data

  const [user] = await db
    .select({
      password: usersTable.password,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1)
    .execute()

  if (!user) {
    session.destroy()
    redirect(routes.AUTH.LOGIN)
  }

  if (!(await verify(user.password, currentPassword))) {
    return validationErrorResult(
      new ZodError([
        {
          path: ['currentPassword'],
          message: 'Current password is incorrect',
          code: 'custom',
        },
      ]),
    )
  }

  await db
    .update(usersTable)
    .set({
      password: await hash(password),
      credentialsUpdatedAt: new Date(),
    })
    .where(eq(usersTable.id, session.user.id))
    .execute()

  session.destroy()

  return successResult(undefined)
}
