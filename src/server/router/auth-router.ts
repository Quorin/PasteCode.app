import dayjs from 'dayjs'
import { z } from 'zod'
import { createRouter } from './context'
import * as argon2 from 'argon2'
import trpc from '@trpc/server'
import { SessionUser } from '../../utils/useUser'

const unauthorized: SessionUser = {
  id: '',
  name: '',
  isLoggedIn: false,
}

export const authRouter = createRouter()
  .mutation('logout', {
    async resolve({ ctx }) {
      ctx.session?.destroy()
    },
  })
  .mutation('login', {
    input: z.object({
      email: z.string().email('Invalid email'),
      password: z.string(),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      })

      if (!user) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new z.ZodError([
            {
              path: ['email', 'password'],
              message: 'Invalid email or password.',
              code: 'custom',
            },
          ]),
        })
      }

      if (!user?.confirmed) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new z.ZodError([
            {
              code: 'custom',
              message: 'Email is not confirmed',
              path: ['email'],
            },
          ]),
        })
      }

      if (!(await argon2.verify(user.password ?? '', input.password))) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new z.ZodError([
            {
              path: ['email', 'password'],
              message: 'Invalid email or password.',
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
          isLoggedIn: true,
        }

        await ctx.session.save()
      }
    },
  })
  .query('checkSession', {
    async resolve({ ctx }) {
      if (!ctx.session?.user?.id) {
        return unauthorized
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
          isLoggedIn: true,
        }
      }

      if (user && user.credentialsUpdatedAt) {
        if (
          dayjs(user.credentialsUpdatedAt).isAfter(
            ctx.session.user.credentialsUpdatedAt ?? new Date(0),
          )
        ) {
          console.log('user.credentialsUpdatedAt', user.credentialsUpdatedAt)
          console.log(
            'ctx.session.user.credentialsUpdatedAt',
            ctx.session.user.credentialsUpdatedAt,
          )
          return unauthorized
        }
      }

      return {
        ...ctx.session.user,
        isLoggedIn: true,
      }
    },
  })
