'use server'

import dayjs from 'dayjs'
import {
  confirmationCodeLength,
  resetPasswordsTable,
  usersTable,
} from '../../../db/schema'
import { createAction, publicProcedure } from '../../server/router/context'
import { resetPasswordSchema } from '../../server/router/schema'
import { sendResetPasswordEmail } from '../../utils/email'
import { generateRandomString } from '../../utils/random'
import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import { eq } from 'drizzle-orm'

export const resetPasswordAction = createAction(
  publicProcedure
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
          throw new TRPCError({
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
)
