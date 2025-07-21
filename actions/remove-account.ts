'use server'

import { routes } from '@/constants/routes'
import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { removeAccountSchema } from '@/server/schema'
import { os } from '@orpc/server'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { loggedIn } from './middlewares/logged-in'

export const removeAccount = os
  .use(loggedIn)
  .errors({
    BAD_REQUEST: {
      data: z.partialRecord(removeAccountSchema.keyof(), z.string()),
    },
  })
  .input(removeAccountSchema)
  .output(z.void())
  .handler(async ({ input: { password }, context: { session }, errors }) => {
    const [user] = await db
      .select({
        password: usersTable.password,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1)
      .execute()

    if (!user?.password || !(await verify(user.password, password))) {
      throw errors.BAD_REQUEST({
        data: {
          password: 'Password is incorrect',
        },
      })
    }

    await db
      .delete(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .execute()

    session.destroy()

    redirect(routes.HOME)
  })
  .actionable()
