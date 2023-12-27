'use server'

import { routes } from '@/constants/routes'
import { db } from '@/db/db'
import { pastesTable } from '@/db/schema'
import { removePasteSchema } from '@/server/trpc/schema'
import { auth } from '@/utils/auth'
import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'

export const removePasteAction = async (
  input: z.infer<typeof removePasteSchema>,
) => {
  const { user } = await auth()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  const { id, password } = removePasteSchema.parse(input)

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

  if (paste.password) {
    if (password) {
      const valid = await verify(paste.password, password)
      if (!valid) {
        redirect(routes.HOME)
      }
    } else {
      redirect(routes.HOME)
    }
  }

  await db.delete(pastesTable).where(eq(pastesTable.id, id)).execute()
  redirect(routes.HOME)
}
