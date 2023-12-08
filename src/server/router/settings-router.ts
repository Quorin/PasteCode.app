import { ZodError } from 'zod'
import * as trpc from '@trpc/server'
import { generateRandomString } from '../../utils/random'
import { sendConfirmationEmail } from '../../utils/email'
import dayjs from 'dayjs'
import { verify, hash } from 'argon2'
import {
  changeEmailSchema,
  changeNameSchema,
  changePasswordSchema,
  removeAccountSchema,
} from './schema'
import { createTRPCRouter, protectedProcedure } from './context'

export const settingsRouter = createTRPCRouter({
  removeAccount: protectedProcedure
    .input(removeAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
        select: { password: true },
      })

      if (!user?.password || !(await verify(user.password, input.password))) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['password'],
              message: 'Password is incorrect',
              code: 'custom',
            },
          ]),
        })
      }

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

      ctx.session.destroy()

      return true
    }),
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
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

      if (!(await verify(user.password, input.currentPassword))) {
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
          password: await hash(input.password),
          credentialsUpdatedAt: new Date(),
        },
      })
    }),
  changeEmail: protectedProcedure
    .input(changeEmailSchema)
    .mutation(async ({ ctx, input }) => {
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
    }),
  changeName: protectedProcedure
    .input(changeNameSchema)
    .mutation(async ({ ctx, input }) => {
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

      ctx.session.user.name = input.name
      await ctx.session.save()
    }),
})
