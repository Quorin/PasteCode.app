'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/db/db'
import { resetPasswordsTable } from '@/db/schema'
import dayjs from 'dayjs'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'
import { z } from 'zod'

const inputSchema = z.object({
  id: z.string(),
  code: z.string(),
})

export const checkResetPassword = async <
  TInput extends z.infer<typeof inputSchema>,
>(
  input: TInput,
): Promise<ActionResult<boolean, TInput>> => {
  const validation = inputSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { id, code } = validation.data

  const [rp] = await db
    .select({
      id: resetPasswordsTable.id,
      expiresAt: resetPasswordsTable.expiresAt,
    })
    .from(resetPasswordsTable)
    .where(
      and(eq(resetPasswordsTable.id, id), eq(resetPasswordsTable.code, code)),
    )
    .limit(1)
    .execute()

  return successResult(!!(rp && dayjs().isBefore(rp.expiresAt)))
}
