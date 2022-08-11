import { z, ZodError } from 'zod'
import { createProtectedRouter } from './protected-router'
import * as trpc from '@trpc/server'
import { generateRandomString } from '../../utils/random'
import { sendConfirmationEmail } from '../../utils/email'
import dayjs from 'dayjs'

export const settingsRouter = createProtectedRouter()
  .mutation('changeEmail', {
    input: z
      .object({
        email: z.string().email('Email is not valid'),
        confirmEmail: z.string().email('Email is not valid'),
      })
      .refine((data) => data.email === data.confirmEmail, {
        message: 'Emails do not match',
        path: ['confirmEmail'],
      }),
    async resolve({ ctx, input }) {
      const code = generateRandomString(36)

      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          email: input.email,
          confirmed: false,
          confirmationCode: {
            upsert: {
              update: {
                code,
                expiresAt: dayjs().add(48, 'hours').toDate(),
              },
              create: {
                code,
                expiresAt: dayjs().add(48, 'hours').toDate(),
              },
            },
          },
        },
        select: {
          id: true,
          confirmationCode: {
            select: {
              id: true,
            },
          },
        },
      })

      await sendConfirmationEmail(
        input.email,
        user.confirmationCode?.id ?? '',
        code,
      )
    },
  })
  .mutation('changeName', {
    input: z.object({
      name: z.string().max(24, 'Name must be shorter or equal 24'),
    }),
    async resolve({ input, ctx }) {
      const exists = await ctx.prisma.user.findFirst({
        where: { id: input.name },
        select: { id: true },
      })

      if (exists) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['name'],
              message: 'Provided name is already taken.',
              code: 'custom',
            },
          ]),
        })
      }

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      })
    },
  })
