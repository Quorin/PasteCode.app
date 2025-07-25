'use server'

import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { sessionOptions } from '@/server/auth/config'
import { changePasswordSchema } from '@/server/schema'
import { os } from '@orpc/server'
import { hash, verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { loggedIn } from './middlewares/logged-in'

export const changePassword = os
  .use(loggedIn)
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(changePasswordSchema.keyof(), z.string()),
    },
  })
  .input(changePasswordSchema)
  .output(z.void())
  .handler(
    async ({
      input: { password, currentPassword },
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

      if (!user) {
        const cookieStore = await cookies()
        cookieStore.delete(sessionOptions.cookieName)
        return
      }

      if (!(await verify(user.password, currentPassword))) {
        throw errors.BAD_REQUEST({
          data: {
            currentPassword: 'Current password is incorrect',
          },
        })
      }

      await db
        .update(usersTable)
        .set({
          password: await hash(password),
        })
        .where(eq(usersTable.id, userId))
        .execute()

      const cookieStore = await cookies()
      cookieStore.delete(sessionOptions.cookieName)
    },
  )
  .actionable()
