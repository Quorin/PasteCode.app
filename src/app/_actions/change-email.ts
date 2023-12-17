'use server'

import { eq } from 'drizzle-orm'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '../../../db/schema'
import { createAction, protectedProcedure } from '../../server/router/context'
import { changeEmailSchema } from '../../server/router/schema'
import { generateRandomString } from '../../utils/random'
import dayjs from 'dayjs'
import { sendConfirmationEmail } from '../../utils/email'

export const changeEmailAction = createAction(
  protectedProcedure
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

      ctx.session.destroy()
    }),
)
