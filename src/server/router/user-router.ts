import { z, ZodError, ZodIssue } from 'zod'
import { createTRPCRouter, publicProcedure } from './context'
import { verify, hash } from 'argon2'
import * as trpc from '@trpc/server'
import dayjs from 'dayjs'
import { generateRandomString } from '../../utils/random'
import {
  sendConfirmationEmail,
  sendResetPasswordEmail,
} from '../../utils/email'
import {
  registerSchema,
  resetPasswordConfirmationSchema,
  resetPasswordSchema,
} from './schema'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  resetPasswordsTable,
  usersTable,
} from '../../../db/schema'
import { and, eq, or, sql } from 'drizzle-orm'

export const userRouter = createTRPCRouter({
  resendConfirmationCode: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          confirmed: usersTable.confirmed,
        })
        .from(usersTable)
        .where(eq(usersTable.email, input.email))
        .limit(1)
        .execute()

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

      const code = generateRandomString(confirmationCodeLength)

      const [confirmation] = await ctx.db
        .select({
          id: confirmationCodesTable.id,
          userId: confirmationCodesTable.userId,
          createdAt: confirmationCodesTable.createdAt,
        })
        .from(confirmationCodesTable)
        .where(eq(confirmationCodesTable.userId, user.id))
        .limit(1)
        .execute()

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

      const [newConfirmation] = await ctx.db
        .insert(confirmationCodesTable)
        .values({
          code,
          userId: user.id,
          createdAt: new Date(),
          expiresAt: dayjs().add(48, 'hours').toDate(),
        })
        .onConflictDoUpdate({
          set: {
            code: sql`code`,
            expiresAt: sql`expires_at`,
          },
          target: confirmationCodesTable.id,
        })
        .returning({
          id: confirmationCodesTable.id,
        })
        .execute()

      await sendConfirmationEmail(input.email, newConfirmation!.id, code)
    }),
  resetPasswordConfirmation: publicProcedure
    .input(resetPasswordConfirmationSchema)
    .mutation(async ({ ctx, input }) => {
      const [rp] = await ctx.db
        .select({
          id: resetPasswordsTable.id,
          userId: resetPasswordsTable.userId,
          code: resetPasswordsTable.code,
          expiresAt: resetPasswordsTable.expiresAt,
          user: {
            id: usersTable.id,
          },
        })
        .from(resetPasswordsTable)
        .innerJoin(usersTable, eq(usersTable.id, resetPasswordsTable.userId))
        .where(
          and(
            eq(resetPasswordsTable.id, input.id),
            eq(resetPasswordsTable.code, input.code),
          ),
        )
        .limit(1)
        .execute()

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

      await ctx.db
        .update(usersTable)
        .set({
          password: await hash(input.password),
          credentialsUpdatedAt: new Date(),
        })
        .where(eq(usersTable.id, rp.userId))
        .execute()

      await ctx.db
        .delete(resetPasswordsTable)
        .where(eq(resetPasswordsTable.id, rp.id))
        .execute()
    }),
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          resetPassword: {
            id: resetPasswordsTable.id,
            code: resetPasswordsTable.code,
            expiresAt: resetPasswordsTable.expiresAt,
          },
        })
        .from(usersTable)
        .leftJoin(
          resetPasswordsTable,
          eq(resetPasswordsTable.userId, usersTable.id),
        )
        .where(eq(usersTable.email, input.email))
        .limit(1)
        .execute()

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

      const code = generateRandomString(confirmationCodeLength)
      const expiresAt = dayjs().add(10, 'minute').toDate()

      const [rp] = await ctx.db
        .insert(resetPasswordsTable)
        .values({
          code,
          expiresAt,
          userId: user.id,
        })
        .onConflictDoUpdate({
          set: {
            code,
            expiresAt,
          },
          target: resetPasswordsTable.id,
        })
        .returning({
          id: resetPasswordsTable.id,
        })
        .execute()

      await sendResetPasswordEmail(input.email, rp!.id, code)
    }),
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
        })
        .from(usersTable)
        .where(
          or(
            eq(usersTable.email, input.email),
            eq(usersTable.name, input.name),
          ),
        )
        .limit(1)
        .execute()

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

      const code = generateRandomString(confirmationCodeLength)

      const [createdUser] = await ctx.db
        .insert(usersTable)
        .values({
          email: input.email,
          name: input.name,
          password: await hash(input.password),
          acceptTerms: true,
          confirmed: false,
        })
        .returning({
          id: usersTable.id,
        })
        .execute()

      const [confirmationCode] = await ctx.db
        .insert(confirmationCodesTable)
        .values({
          code,
          userId: createdUser!.id,
          createdAt: new Date(),
          expiresAt: dayjs().add(48, 'hours').toDate(),
        })
        .returning({
          id: confirmationCodesTable.id,
        })
        .execute()

      await sendConfirmationEmail(input.email, confirmationCode!.id, code)

      return true
    }),
})
