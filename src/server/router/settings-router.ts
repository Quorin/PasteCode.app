import { z, ZodError } from 'zod'
import { createProtectedRouter } from './protected-router'
import * as trpc from '@trpc/server'
import { generateRandomString } from '../../utils/random'
import { sendConfirmationEmail } from '../../utils/email'
import dayjs from 'dayjs'
import * as argon2 from 'argon2'

export const settingsRouter = createProtectedRouter()
  .mutation('removeAccount', {
    async resolve({ ctx }) {
      await ctx.prisma.user.delete({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          confirmationCode: true,
          resetPassword: true,
          pastes: true,
        },
      })
      return true
    },
  })
  .mutation('changePassword', {
    input: z
      .object({
        currentPassword: z.string(),
        password: z
          .string()
          .regex(
            new RegExp(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
            ),
            'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character',
          ),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      }),
    async resolve({ input, ctx }) {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id! },
        select: { password: true },
      })

      if (!user) {
        throw new trpc.TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        })
      }

      if (!(await argon2.verify(user.password, input.currentPassword))) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['currentPassword'],
              message: 'Current password is incorrect',
              code: 'custom',
            },
          ]),
        })
      }

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id! },
        data: {
          password: await argon2.hash(input.password),
          credentialsUpdatedAt: new Date(),
        },
      })
    },
  })
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
          credentialsUpdatedAt: new Date(),
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
