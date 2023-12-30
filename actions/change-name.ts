'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { changeNameSchema } from '@/server/schema'
import { ZodError, z } from 'zod'
import { db } from '@/db/db'
import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/errorHandler'

export const changeNameAction = async <
  TInput extends z.infer<typeof changeNameSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const session = await auth()

  if (!session.user) {
    redirect(routes.AUTH.LOGIN)
  }

  const validation = changeNameSchema.safeParse(input)

  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const [exists] = await db
    .select({
      id: usersTable.id,
    })
    .from(usersTable)
    .where(eq(usersTable.name, validation.data.name))
    .limit(1)
    .execute()

  if (exists) {
    return validationErrorResult(
      new ZodError([
        {
          path: ['name'],
          message: 'Provided name is already taken.',
          code: 'custom',
        },
      ]),
    )
  }

  const credentialsUpdatedAt = new Date()

  await db
    .update(usersTable)
    .set({
      name: validation.data.name,
      credentialsUpdatedAt,
    })
    .where(eq(usersTable.id, session.user.id))
    .execute()

  session.user.name = validation.data.name
  session.user.credentialsUpdatedAt = credentialsUpdatedAt

  await session.save()

  return successResult(undefined)
}
