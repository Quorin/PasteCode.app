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
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '../../../db/schema'
import { eq } from 'drizzle-orm'

export const settingsRouter = createTRPCRouter({
  removeAccount: protectedProcedure
    .input(removeAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .limit(1)
        .execute()

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

      await ctx.db
        .delete(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()

      ctx.session.destroy()

      return true
    }),
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .limit(1)
        .execute()

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

      await ctx.db
        .update(usersTable)
        .set({
          password: await hash(input.password),
          credentialsUpdatedAt: new Date(),
        })
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()
    }),
  changeEmail: protectedProcedure
    .input(changeEmailSchema)
    .mutation(async ({ ctx, input }) => {
      const code = generateRandomString(confirmationCodeLength)

      await ctx.db
        .update(usersTable)
        .set({
          email: input.email,
          confirmed: false,
          credentialsUpdatedAt: new Date(),
        })
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()

      const [confirmationCode] = await ctx.db
        .insert(confirmationCodesTable)
        .values({
          code,
          expiresAt: dayjs().add(48, 'hours').toDate(),
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          set: {
            code,
            expiresAt: dayjs().add(48, 'hours').toDate(),
          },
          target: confirmationCodesTable.id,
        })
        .returning({
          id: confirmationCodesTable.id,
        })
        .execute()

      await sendConfirmationEmail(input.email, confirmationCode!.id, code)
    }),
  changeName: protectedProcedure
    .input(changeNameSchema)
    .mutation(async ({ ctx, input }) => {
      const [exists] = await ctx.db
        .select({
          id: usersTable.id,
        })
        .from(usersTable)
        .where(eq(usersTable.name, input.name))
        .limit(1)
        .execute()

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

      const credentialsUpdatedAt = new Date()

      await ctx.db
        .update(usersTable)
        .set({
          name: input.name,
          credentialsUpdatedAt,
        })
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()

      ctx.session.user.name = input.name
      ctx.session.user.credentialsUpdatedAt = credentialsUpdatedAt

      await ctx.session.save()
    }),
})
