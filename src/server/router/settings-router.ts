import { z, ZodError } from 'zod'
import { createProtectedRouter } from './protected-router'
import * as trpc from '@trpc/server'
import { generateRandomString } from '../../utils/random'
import { sendConfirmationEmail } from '../../utils/email'
import dayjs from 'dayjs'
import * as argon2 from 'argon2'
import {
  changeEmailSchema,
  changeNameSchema,
  changePasswordSchema,
  removeAccountSchema,
} from './schema'

export const settingsRouter = createProtectedRouter()
  .mutation('removeAccount', {
    input: removeAccountSchema,
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
        select: { password: true },
      })

      if (
        !user?.password ||
        !(await argon2.verify(user.password, input.password))
      ) {
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
      return true
    },
  })
  .mutation('changePassword', {
    input: changePasswordSchema,
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
    input: changeEmailSchema,
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
    input: changeNameSchema,
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

      ctx.session.user.name = input.name
      await ctx.session.save()
    },
  })
