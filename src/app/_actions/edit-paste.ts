'use server'

import { TRPCError } from '@trpc/server'
import { pastesTable } from '../../../db/schema'
import { createAction, protectedProcedure } from '../../server/router/context'
import { updatePasteSchema } from '../../server/router/schema'
import { eq } from 'drizzle-orm'
import { hash, verify } from 'argon2'
import Cryptr from 'cryptr'
import { getExpirationDate, upsertTagsOnPaste } from '../../utils/paste'
import { revalidateTag } from 'next/cache'

export const editPasteAction = createAction(
  protectedProcedure
    .input(updatePasteSchema)
    .mutation(async ({ input, ctx }) => {
      const [paste] = await ctx.db
        .select({
          id: pastesTable.id,
          userId: pastesTable.userId,
          password: pastesTable.password,
          expiresAt: pastesTable.expiresAt,
        })
        .from(pastesTable)
        .where(eq(pastesTable.id, input.id))
        .limit(1)
        .execute()

      if (!paste) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Paste not found',
        })
      }

      if (paste.userId !== ctx.session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to edit this paste',
        })
      }

      if (input.currentPassword && paste.password) {
        const valid = await verify(paste.password, input.currentPassword)
        if (!valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password is incorrect',
          })
        }
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password is required',
        })
      }

      await ctx.db
        .update(pastesTable)
        .set({
          title: input.title,
          content: input.password
            ? new Cryptr(input.password).encrypt(input.content)
            : input.content,
          style: input.style,
          description: input.description,
          expiresAt: getExpirationDate(
            input.expiration,
            paste.expiresAt ? new Date(paste.expiresAt) : null,
          ),
          password: input.password ? await hash(input.password) : null,
        })
        .where(eq(pastesTable.id, input.id))
        .execute()

      await upsertTagsOnPaste(ctx.db, input.tags, input.id)

      revalidateTag(`paste:${input.id}`)
    }),
)
