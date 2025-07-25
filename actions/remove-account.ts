'use server'

import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { removeAccountSchema } from '@/server/schema'
import { os } from '@orpc/server'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { loggedIn } from './middlewares/logged-in'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/server/auth/config'

export const removeAccount = os
  .use(loggedIn)
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(removeAccountSchema.keyof(), z.string()),
    },
  })
  .input(removeAccountSchema)
  .output(z.void())
  .handler(
    async ({
      input: { password },
      context: {
        user: { id: userId },
      },
      errors,
    }) => {
      const [user] = await db
        .select({
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)
        .execute()

      if (!user?.password || !(await verify(user.password, password))) {
        throw errors.BAD_REQUEST({
          data: {
            password: 'Password is incorrect',
          },
        })
      }

      await db.delete(usersTable).where(eq(usersTable.id, userId)).execute()

      const cookieStore = await cookies()
      cookieStore.delete(sessionOptions.cookieName)
    },
  )
  .actionable()
