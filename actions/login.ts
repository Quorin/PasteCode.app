'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { createAction, publicProcedure } from '@/server/trpc/context'
import { loginSchema } from '@/server/trpc/schema'
import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import { verify } from 'argon2'

export const loginAction = createAction(
  publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const [user] = await ctx.db
      .select({
        id: usersTable.id,
        confirmed: usersTable.confirmed,
        email: usersTable.email,
        password: usersTable.password,
        name: usersTable.name,
        credentialsUpdatedAt: usersTable.credentialsUpdatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1)
      .execute()

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        cause: new ZodError([
          {
            path: ['password'],
            message: 'Invalid email or password.',
            code: 'custom',
          },
        ]),
      })
    }

    if (!user?.confirmed) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        cause: new ZodError([
          {
            code: 'custom',
            message: 'Email is not confirmed',
            path: ['email'],
          },
        ]),
      })
    }

    if (!(await verify(user.password ?? '', input.password))) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        cause: new ZodError([
          {
            message: 'Invalid email or password.',
            path: ['password'],
            code: 'custom',
          },
        ]),
      })
    }

    if (ctx.session) {
      ctx.session.user = {
        id: user.id,
        name: user.name,
        credentialsUpdatedAt: user.credentialsUpdatedAt,
      }

      await ctx.session.save()
    }
  }),
)
