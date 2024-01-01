'use server'

import { db } from '@/db/db'
import { confirmationCodesTable, usersTable } from '@/db/schema'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'
import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const inputSchema = z.object({
  id: z.string(),
  code: z.string(),
})

export const confirmAccountAction = async <
  TInput extends z.infer<typeof inputSchema>,
>(
  input: TInput,
): Promise<ActionResult<boolean, TInput>> => {
  const validation = inputSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { id, code } = validation.data

  const [confirmation] = await db
    .select({
      id: confirmationCodesTable.id,
      expiresAt: confirmationCodesTable.expiresAt,
      userId: confirmationCodesTable.userId,
    })
    .from(confirmationCodesTable)
    .where(
      and(
        eq(confirmationCodesTable.id, id),
        eq(confirmationCodesTable.code, code),
      ),
    )
    .limit(1)
    .execute()

  if (!confirmation || dayjs().isAfter(confirmation.expiresAt)) {
    return successResult(false)
  }

  await db
    .update(usersTable)
    .set({
      confirmed: true,
    })
    .where(eq(usersTable.id, confirmation.userId))
    .execute()

  await db
    .delete(confirmationCodesTable)
    .where(eq(confirmationCodesTable.id, confirmation.id))
    .execute()

  return successResult(true)
}
