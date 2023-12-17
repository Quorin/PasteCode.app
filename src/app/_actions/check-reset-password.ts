'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/db'
import { resetPasswordsTable } from '../../../db/schema'
import dayjs from 'dayjs'

export const checkResetPassword = async (id: string, code: string) => {
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

  return rp && dayjs().isBefore(rp.expiresAt)
}
