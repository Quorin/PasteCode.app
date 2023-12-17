'use server'

import { ZodError, z } from 'zod'
import { createAction, publicProcedure } from '../../server/router/context'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '../../../db/schema'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { sendConfirmationEmail } from '../../utils/email'
import { TRPCError } from '@trpc/server'
import { generateRandomString } from '../../utils/random'

export const resendConfirmationCodeAction = createAction(
  publicProcedure
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
        throw new TRPCError({
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
        throw new TRPCError({
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
        throw new TRPCError({
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

      const expiresAt = dayjs().add(48, 'hours').toDate()

      const [newConfirmation] = await ctx.db
        .insert(confirmationCodesTable)
        .values({
          code,
          userId: user.id,
          createdAt: new Date(),
          expiresAt,
        })
        .onConflictDoUpdate({
          set: {
            code,
            expiresAt,
          },
          target: confirmationCodesTable.id,
        })
        .returning({
          id: confirmationCodesTable.id,
        })
        .execute()

      await sendConfirmationEmail(input.email, newConfirmation!.id, code)
    }),
)
