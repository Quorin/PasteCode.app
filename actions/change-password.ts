'use server'

import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { loggedIn } from '@/lib/orpc'
import { sessionOptions } from '@/server/auth/config'
import { changePasswordSchema } from '@/server/schema'
import { os } from '@orpc/server'
import { hash, verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { z } from 'zod'

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
      context: { session },
      errors,
    }) => {
      const [user] = await db
        .select({
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.id, session.user.id))
        .limit(1)
        .execute()

      if (!user) {
        session.destroy()
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
          credentialsUpdatedAt: new Date(),
        })
        .where(eq(usersTable.id, session.user.id))
        .execute()

      const cookieStore = await cookies()
      cookieStore.delete(sessionOptions.cookieName)
    },
  )
  .actionable()
