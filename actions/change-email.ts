'use server'

import { eq } from 'drizzle-orm'
import {
  confirmationCodeLength,
  confirmationCodesTable,
  usersTable,
} from '@/db/schema'
import { changeEmailSchema } from '@/server/schema'
import { generateRandomString } from '@/utils/random'
import dayjs from 'dayjs'
import { sendConfirmationEmail } from '@/utils/email'
import { z } from 'zod'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { routes } from '@/constants/routes'
import { db } from '@/db/db'
import {
  ActionResult,
  successResult,
  validationErrorResult,
} from '@/utils/error-handler'

export const changeEmailAction = async <
  TInput extends z.infer<typeof changeEmailSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const session = await getSession()

  if (!session.user) {
    redirect(routes.AUTH.LOGIN)
  }

  const validation = changeEmailSchema.safeParse(input)

  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const code = generateRandomString(confirmationCodeLength)

  await db
    .update(usersTable)
    .set({
      email: validation.data.email,
      confirmed: false,
      credentialsUpdatedAt: new Date(),
    })
    .where(eq(usersTable.id, session.user.id))
    .execute()

  const [confirmationCode] = await db
    .insert(confirmationCodesTable)
    .values({
      code,
      expiresAt: dayjs().add(48, 'hours').toDate(),
      userId: session.user.id,
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

  await sendConfirmationEmail(validation.data.email, confirmationCode!.id, code)

  session.destroy()

  return successResult(undefined)
}
