'use server'

import { and, eq } from 'drizzle-orm'
import { resetPasswordsTable, usersTable } from '@/db/schema'
import { resetPasswordConfirmationSchema } from '@/server/schema'
import { hash } from 'argon2'
import { ZodError, z } from 'zod'
import dayjs from 'dayjs'
import { db } from '@/db/db'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'

export const resetPasswordConfirmationAction = async <
  TInput extends z.infer<typeof resetPasswordConfirmationSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const validation = resetPasswordConfirmationSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { password, code, id } = validation.data

  const [rp] = await db
    .select({
      id: resetPasswordsTable.id,
      userId: resetPasswordsTable.userId,
      code: resetPasswordsTable.code,
      expiresAt: resetPasswordsTable.expiresAt,
      user: {
        id: usersTable.id,
      },
    })
    .from(resetPasswordsTable)
    .innerJoin(usersTable, eq(usersTable.id, resetPasswordsTable.userId))
    .where(
      and(eq(resetPasswordsTable.id, id), eq(resetPasswordsTable.code, code)),
    )
    .limit(1)
    .execute()

  if (!rp || dayjs().isAfter(rp.expiresAt)) {
    return validationErrorResult(
      new ZodError([
        {
          path: ['password'],
          message: 'Code is incorrect or expired',
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
    .where(eq(usersTable.id, rp.userId))
    .execute()

  await db
    .delete(resetPasswordsTable)
    .where(eq(resetPasswordsTable.id, rp.id))
    .execute()

  redirect(routes.AUTH.LOGIN)
}
