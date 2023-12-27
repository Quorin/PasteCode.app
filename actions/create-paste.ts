'use server'

import Cryptr from 'cryptr'
import { createAction, publicProcedure } from '@/server/trpc/context'
import { createPasteSchema } from '@/server/trpc/schema'
import { getExpirationDate, upsertTagsOnPaste } from '@/utils/paste'
import { hash } from 'argon2'
import { pastesTable } from '@/db/schema'

export const createPasteAction = createAction(
  publicProcedure.input(createPasteSchema).mutation(async ({ input, ctx }) => {
    const [paste] = await ctx.db
      .insert(pastesTable)
      .values({
        title: input.title,
        content: input.password
          ? new Cryptr(input.password).encrypt(input.content)
          : input.content,
        style: input.style,
        description: input.description,
        expiresAt: getExpirationDate(input.expiration),
        password: input.password ? await hash(input.password) : null,
        userId: ctx.session?.user?.id ?? null,
      })
      .returning({
        id: pastesTable.id,
      })
      .execute()

    await upsertTagsOnPaste(ctx.db, input.tags, paste!.id)

    return paste!.id
  }),
)
