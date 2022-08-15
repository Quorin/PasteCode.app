import { z, ZodError, ZodIssue } from 'zod'
import { createRouter } from './context'
import * as argon2 from 'argon2'
import * as trpc from '@trpc/server'
import dayjs from 'dayjs'
import { generateRandomString } from '../../utils/random'
import {
  sendConfirmationEmail,
  sendResetPasswordEmail,
} from '../../utils/email'

export const userRouter = createRouter()
  .mutation('resendConfirmationCode', {
    input: z.object({
      email: z.string().email('Invalid email'),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findFirst({
        where: { email: input.email },
        select: { id: true, confirmed: true },
      })

      if (!user) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['email'],
              message:
                'Account with this email does not exist. Please sign up.',
              code: 'custom',
            },
          ]),
        })
      }

      if (user.confirmed) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['email'],
              message: 'Account is already confirmed. Please sign in.',
              code: 'custom',
            },
          ]),
        })
      }

      const code = generateRandomString(36)

      let confirmation = await ctx.prisma.confirmationCode.findFirst({
        where: {
          userId: user.id,
        },
      })

      if (
        confirmation &&
        dayjs().diff(dayjs(confirmation.createdAt), 'minute') < 10
      ) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['email'],
              message:
                'You have to wait 10 minutes before requesting a new confirmation code',
              code: 'custom',
            },
          ]),
        })
      }

      confirmation = await ctx.prisma.confirmationCode.upsert({
        where: {
          userId: user.id,
        },
        update: {
          code,
          expiresAt: dayjs().add(48, 'hours').toDate(),
        },
        create: {
          code,
          expiresAt: dayjs().add(48, 'hours').toDate(),
          user: {
            connect: {
              email: input.email,
            },
          },
        },
      })

      await sendConfirmationEmail(input.email, confirmation.id, code)
    },
  })
  .mutation('resetPasswordConfirmation', {
    input: z
      .object({
        id: z.string(),
        code: z.string(),
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
    async resolve({ ctx, input }) {
      const rp = await ctx.prisma.resetPassword.findFirst({
        where: { id: input.id, code: input.code },
        include: { user: true },
      })

      if (!rp || dayjs().isAfter(rp.expiresAt)) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['password'],
              message: 'Code is incorrect or expired',
              code: 'custom',
            },
          ]),
        })
      }

      await ctx.prisma.$transaction([
        ctx.prisma.user.update({
          where: {
            id: rp.user.id,
          },
          data: {
            password: await argon2.hash(input.password),
            credentialsUpdatedAt: new Date(),
          },
        }),
        ctx.prisma.resetPassword.delete({ where: { id: rp.id } }),
      ])
    },
  })
  .mutation('resetPassword', {
    input: z.object({
      email: z.string().email('Email is not valid'),
    }),
    async resolve({ input, ctx }) {
      const user = await ctx.prisma.user.findFirst({
        where: { email: input.email },
        include: { resetPassword: true },
      })

      if (!user) {
        return
      }

      if (user.resetPassword) {
        if (user.resetPassword.expiresAt > new Date()) {
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            cause: new ZodError([
              {
                path: ['email'],
                message: 'You need to wait few minutes for another try',
                code: 'custom',
              },
            ]),
          })
        }
      }

      const code = generateRandomString(36)
      const expiresAt = dayjs().add(10, 'minute').toDate()

      const rp = await ctx.prisma.resetPassword.upsert({
        where: { id: user.resetPassword?.id ?? '' },
        create: {
          code,
          expiresAt,
          user: {
            connect: { id: user.id },
          },
        },
        update: {
          code,
          expiresAt,
        },
        select: {
          id: true,
        },
      })

      await sendResetPasswordEmail(input.email, rp.id, code)

      return
    },
  })
  .mutation('register', {
    input: z
      .object({
        email: z.string().email('Email is not valid'),
        name: z.string().max(24, 'Name must be shorter or equal 24'),
        password: z
          .string()
          .regex(
            new RegExp(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
            ),
            'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character',
          ),

        confirmPassword: z.string(),
        agree: z
          .boolean()
          .refine(
            (agree) => agree === true,
            'You must agree to the terms and conditions',
          ),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      }),

    async resolve({ input, ctx }) {
      const user = await ctx.prisma.user.findFirst({
        where: { OR: [{ email: input.email }, { name: input.name }] },
      })

      if (user) {
        let errors: ZodIssue[] = []

        if (user.email === input.email) {
          errors.push({
            message: 'Provided email is already in use',
            path: ['email'],
            code: 'custom',
          })
        }

        if (user.name === input.name) {
          errors.push({
            message: 'Provided name is already in use',
            path: ['name'],
            code: 'custom',
          })
        }

        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError(errors),
        })
      }

      const code = generateRandomString(36)

      const createdUser = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: await argon2.hash(input.password),
          acceptTerms: true,
          confirmed: false,
          confirmationCode: {
            create: {
              code,
              expiresAt: dayjs().add(48, 'hours').toDate(),
            },
          },
        },
        include: {
          confirmationCode: {
            select: {
              id: true,
            },
          },
        },
      })

      await sendConfirmationEmail(
        input.email,
        createdUser.confirmationCode!.id,
        code,
      )

      return true
    },
  })
