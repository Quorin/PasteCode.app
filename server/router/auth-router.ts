import dayjs from 'dayjs'
import { ZodError } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/router/context'
import { verify } from 'argon2'
import { loginSchema } from '@/server/router/schema'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const authRouter = createTRPCRouter({
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy()
  }),
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
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
  checkSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      return null
    }

    const [user] = await ctx.db
      .select({
        credentialsUpdatedAt: usersTable.credentialsUpdatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, ctx.session.user.id))
      .limit(1)
      .execute()

    if (!user) {
      return {
        ...ctx.session.user,
      }
    }

    if (user && user.credentialsUpdatedAt) {
      if (
        dayjs(user.credentialsUpdatedAt).isAfter(
          ctx.session.user.credentialsUpdatedAt ?? new Date(0),
        )
      ) {
        return null
      }
    }

    return {
      ...ctx.session.user,
    }
  }),
})
