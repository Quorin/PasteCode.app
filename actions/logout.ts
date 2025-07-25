'use server'

import { os } from '@orpc/server'
import { z } from 'zod'
import { sessionOptions, type Session } from '@/server/auth/config'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { db } from '@/db/db'
import { sessionsTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const logout = os
  .input(z.void())
  .output(z.void())
  .handler(async () => {
    const session = await getIronSession<Session>(
      await cookies(),
      sessionOptions,
    )

    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, session.id))
      .execute()

    const cookieStore = await cookies()
    cookieStore.delete(sessionOptions.cookieName)
  })
  .actionable()
