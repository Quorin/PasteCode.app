'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '../../../db/schema'
import { createAction, protectedProcedure } from '../../server/router/context'
import { changeNameSchema } from '../../server/router/schema'
import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

export const changeNameAction = createAction(
  protectedProcedure
    .input(changeNameSchema)
    .mutation(async ({ ctx, input }) => {
      const [exists] = await ctx.db
        .select({
          id: usersTable.id,
        })
        .from(usersTable)
        .where(eq(usersTable.name, input.name))
        .limit(1)
        .execute()

      if (exists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['name'],
              message: 'Provided name is already taken.',
              code: 'custom',
            },
          ]),
        })
      }

      const credentialsUpdatedAt = new Date()

      await ctx.db
        .update(usersTable)
        .set({
          name: input.name,
          credentialsUpdatedAt,
        })
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()

      ctx.session.user.name = input.name
      ctx.session.user.credentialsUpdatedAt = credentialsUpdatedAt

      await ctx.session.save()
    }),
)
