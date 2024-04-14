'use server'

import Cryptr from 'cryptr'
import { createPasteSchema } from '@/server/schema'
import { getExpirationDate, upsertTagsOnPaste } from '@/utils/paste'
import { hash } from 'argon2'
import { pastesTable } from '@/db/schema'
import { db } from '@/db/db'
import { getSession } from '@/utils/auth'
import {
  ActionResult,
  validationErrorResult,
  successResult,
} from '@/utils/error-handler'
import { z } from 'zod'

export const createPasteAction = async <
  TInput extends z.infer<typeof createPasteSchema>,
>(
  input: TInput,
): Promise<ActionResult<{ id: string }, TInput>> => {
  const validation = createPasteSchema.safeParse(input)

  if (!validation.success) {
    return validationErrorResult(validation.error)
  }

  const { title, content, style, description, expiration, password, tags } =
    validation.data

  const session = await getSession()

  const [paste] = await db
    .insert(pastesTable)
    .values({
      title,
      content: password ? new Cryptr(password).encrypt(content) : content,
      style,
      description,
      expiresAt: getExpirationDate(expiration),
      password: password ? await hash(password) : null,
      userId: session?.user?.id ?? null,
    })
    .returning({
      id: pastesTable.id,
    })
    .execute()

  await upsertTagsOnPaste(db, tags, paste!.id)

  return successResult({
    id: paste!.id,
  })
}
