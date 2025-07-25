import { db } from '@/db/db'
import { sessionsTable, usersTable } from '@/db/schema'
import { sessionOptions, type Session } from '@/server/auth/config'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { and, eq, gte } from 'drizzle-orm'

export const getUser = async () => {
  const session = await getIronSession<Session>(await cookies(), sessionOptions)

  const [user] = await db
    .select({
      id: usersTable.id,
    })
    .from(sessionsTable)
    .rightJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.id, session.id),
        gte(sessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1)
    .execute()

  return user || null
}
