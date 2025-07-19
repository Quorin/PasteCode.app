import { db } from '@/db/db'
import { usersTable } from '@/db/schema'
import { loginSchema } from '@/server/schema'
import { getSession } from '@/utils/auth'
import { os } from '@orpc/server'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import z from 'zod'

export const authRouter = {
  login: os
    .input(loginSchema)
    .output(z.void())
    .errors({
      BAD_REQUEST: {
        data: z.object({
          email: z.string().optional(),
          password: z.string().optional(),
        }),
      },
    })
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

      if (session) {
        session.user = {
          id: user.id,
          credentialsUpdatedAt: user.credentialsUpdatedAt,
        }

        await session.save()
      }
    })
    .callable(),
  logout: os
    .input(z.void())
    .output(z.void())
    .handler(async () => {
      const session = await getSession()
      session.destroy()
    })
    .callable(),
}
