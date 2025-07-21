import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { sessionOptions, type SessionUser } from '@/server/auth/config'
import { os } from '@orpc/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'

export const getSession = os
  .handler(async () => {
    const session = await getIronSession<{ user: SessionUser | null }>(
      await cookies(),
      sessionOptions,
    )

    if (!session.user) {
      return session
    }

    const [dbUser] = await db
      .select({
        id: usersTable.id,
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
  })
  .callable()
