'use server'

import { ZodError, ZodIssue } from 'zod'
import { createAction, publicProcedure } from '../../server/router/context'
import { registerSchema } from '../../server/router/schema'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '../../../db/schema'
import { eq, or } from 'drizzle-orm'
import { generateRandomString } from '../../utils/random'
import { hash } from 'argon2'
import dayjs from 'dayjs'
import { sendConfirmationEmail } from '../../utils/email'
import { TRPCError } from '@trpc/server'

export const registerAction = createAction(
  publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    const [user] = await ctx.db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(
        or(eq(usersTable.email, input.email), eq(usersTable.name, input.name)),
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

      throw new TRPCError({
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
)
