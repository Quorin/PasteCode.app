'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { ZodError, z } from 'zod'
import { verify } from 'argon2'
import { removeAccountSchema } from '@/server/schema'
import { db } from '@/db/db'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'

export const removeAccountAction = async <
  TInput extends z.infer<typeof removeAccountSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const session = await getSession()

  if (!session.user) {
    redirect(routes.AUTH.LOGIN)
  }

  const validation = removeAccountSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { password } = validation.data

  const [user] = await db
    .select({
      password: usersTable.password,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1)
    .execute()

  if (!user?.password || !(await verify(user.password, password))) {
    return validationErrorResult(
      new ZodError([
        {
          path: ['password'],
          message: 'Password is incorrect',
          code: 'custom',
        },
      ]),
    )
  }

  await db
    .delete(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .execute()

  session.destroy()

  return successResult(undefined)
}
