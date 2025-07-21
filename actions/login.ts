'use server'

import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { loginSchema } from '@/server/schema'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { os } from '@orpc/server'
import { getSession } from './get-session'

export const login = os
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(loginSchema.keyof(), z.string()),
    },
  })
  .input(loginSchema)
  .output(z.void())
  .handler(async ({ input: { email, password }, errors }) => {
    const session = await getSession()
    const [user] = await db
      .select({
        id: usersTable.id,
        confirmed: usersTable.confirmed,
        email: usersTable.email,
        password: usersTable.password,
        credentialsUpdatedAt: usersTable.credentialsUpdatedAt,
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

    session.user = {
      id: user.id,
      credentialsUpdatedAt: user.credentialsUpdatedAt,
    }

    await session.save()
  })
  .actionable()
