'use server'

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/server/auth/config'
import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export type SessionUser = {
  id: string
  name: string
  credentialsUpdatedAt?: Date | null
}

export const auth = async () => {
  const session = await getIronSession<{ user: SessionUser | null }>(
    cookies(),
    sessionOptions,
  )

  if (!session.user) {
    return session
  }

  const [dbUser] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      credentialsUpdatedAt: usersTable.credentialsUpdatedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1)
    .execute()

  if (!dbUser) {
    session.user = null

    return session
  }

  return session
}
