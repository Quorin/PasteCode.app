import dayjs from 'dayjs'
import { z, ZodError } from 'zod'
import { createRouter } from './context'
import * as argon2 from 'argon2'
import trpc from '@trpc/server'

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

      if (!(await argon2.verify(user.password ?? '', input.password))) {
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
    },
  })
  .query('checkSession', {
    async resolve({ ctx }) {
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
          console.log('user.credentialsUpdatedAt', user.credentialsUpdatedAt)
          console.log(
            'ctx.session.user.credentialsUpdatedAt',
            ctx.session.user.credentialsUpdatedAt,
          )
          return null
        }
      }

      return {
        ...ctx.session.user,
      }
    },
  })
