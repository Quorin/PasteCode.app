'use server'

import { pastesTable } from '@/db/schema'
import { updatePasteSchema } from '@/server/schema'
import { eq } from 'drizzle-orm'
import { hash, verify } from 'argon2'
import Cryptr from 'cryptr'
import { getExpirationDate, upsertTagsOnPaste } from '@/utils/paste'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db/db'
import { getSession } from '@/utils/auth'
import { notFound, redirect } from 'next/navigation'
import { routes } from '@/constants/routes'
import { ActionResult, validationErrorResult } from '@/utils/error-handler'

export const editPasteAction = async <
  TInput extends z.infer<typeof updatePasteSchema>,
>(
  input: TInput,
): Promise<ActionResult<undefined, TInput>> => {
  const session = await getSession()

  if (!session.user) {
    redirect(routes.AUTH.LOGIN)
  }

  const validation = updatePasteSchema.safeParse(input)
  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const {
    id,
    content,
    description,
    expiration,
    style,
    title,
    currentPassword,
    password,
    tags,
  } = validation.data

  const [paste] = await db
    .select({
      id: pastesTable.id,
      userId: pastesTable.userId,
      password: pastesTable.password,
      expiresAt: pastesTable.expiresAt,
    })
    .from(pastesTable)
    .where(eq(pastesTable.id, id))
    .limit(1)
    .execute()

  if (!paste) {
    notFound()
  }

  if (paste.userId !== session?.user?.id) {
    redirect('/401')
  }

  if (paste.password) {
    if (!currentPassword) {
      redirect('/401')
    }

    const valid = await verify(paste.password, currentPassword)
    if (!valid) {
      redirect('/401')
    }
  }

  await db
    .update(pastesTable)
    .set({
      title,
      content: password ? new Cryptr(password).encrypt(content) : content,
      style,
      description,
      expiresAt: getExpirationDate(
        expiration,
        paste.expiresAt ? new Date(paste.expiresAt) : null,
      ),
      password: password ? await hash(password) : null,
    })
    .where(eq(pastesTable.id, id))
    .execute()

  await upsertTagsOnPaste(db, tags, id)

  revalidateTag(`code:${id}`)
  revalidateTag(`paste:${id}`)

  redirect(`/pastes/${id}`)
}
