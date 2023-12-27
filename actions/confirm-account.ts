'use server'

import { db } from '@/db/db'
import { confirmationCodesTable, usersTable } from '@/db/schema'
import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'

export const confirmAccountAction = async ({
  id,
  code,
}: {
  id: string
  code: string
}) => {
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
    return false
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

  return true
}
