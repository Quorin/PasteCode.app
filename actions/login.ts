'use server'

import { db } from '@/db/db'
import { sessionsTable, usersTable } from '@/db/schema'
import { loginSchema } from '@/server/schema'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { os } from '@orpc/server'
import dayjs from 'dayjs'
import { getIronSession } from 'iron-session'
import { sessionOptions, type Session } from '@/server/auth/config'
import { cookies } from 'next/headers'

export const login = os
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(loginSchema.keyof(), z.string()),
    },
  })
  .input(loginSchema)
  .output(z.void())
  .handler(async ({ input: { email, password }, errors }) => {
    const session = await getIronSession<Session>(
      await cookies(),
      sessionOptions,
    )

    const [user] = await db
      .select({
        id: usersTable.id,
        confirmed: usersTable.confirmed,
        email: usersTable.email,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .execute()

    if (!user) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'Invalid email or password.',
          password: 'Invalid email or password.',
        },
      })
    }

    if (!user.confirmed) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'Email is not confirmed.',
        },
      })
    }

    if (!(await verify(user.password ?? '', password))) {
      throw errors.BAD_REQUEST({
        data: {
          email: 'Invalid email or password.',
          password: 'Invalid email or password.',
        },
      })
    }

    const [dbSession] = await db
      .insert(sessionsTable)
      .values({
        userId: user.id,
        expiresAt: dayjs().add(1, 'month').toDate(),
      })
      .returning({
        id: sessionsTable.id,
      })
      .execute()

    if (!dbSession) return

    session.id = dbSession.id

    await session.save()
  })
  .actionable()
