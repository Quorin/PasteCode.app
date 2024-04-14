'use server'

import { routes } from '@/constants/routes'
import { db } from '@/db/db'
import { pastesTable } from '@/db/schema'
import { removePasteSchema } from '@/server/schema'
import { getSession } from '@/utils/auth'
import { ActionResult, validationErrorResult } from '@/utils/error-handler'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'

export const removePasteAction = async <
  TInput extends z.infer<typeof removePasteSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const { user } = await getSession()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  const validation = removePasteSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { id, password } = validation.data

  const [paste] = await db
    .select({
      id: pastesTable.id,
      userId: pastesTable.userId,
      password: pastesTable.password,
    })
    .from(pastesTable)
    .where(eq(pastesTable.id, id))
    .limit(1)
    .execute()

  if (!paste) {
    notFound()
  }

  if (paste.userId !== user.id) {
    redirect('/401')
  }

  if (
    paste.password &&
    (!password || !(await verify(paste.password, password)))
  ) {
    redirect(routes.HOME)
  }

  await db.delete(pastesTable).where(eq(pastesTable.id, id)).execute()

  redirect(routes.HOME)
}
