import dayjs from 'dayjs'
import { ZodError } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from './context'
import { verify } from 'argon2'
import * as trpc from '@trpc/server'
import { loginSchema } from './schema'

export const authRouter = createTRPCRouter({
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy()
  }),
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        email: input.email,
      },
    })

    if (!user) {
      throw new trpc.TRPCError({
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
      throw new trpc.TRPCError({
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
      throw new trpc.TRPCError({
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

    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
      select: {
        credentialsUpdatedAt: true,
      },
    })

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
