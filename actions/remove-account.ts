'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { createAction, protectedProcedure } from '@/server/trpc/context'
import { ZodError } from 'zod'
import { TRPCError } from '@trpc/server'
import { verify } from 'argon2'
import { removeAccountSchema } from '@/server/trpc/schema'

export const removeAccountAction = createAction(
  protectedProcedure
    .input(removeAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .limit(1)
        .execute()

      if (!user?.password || !(await verify(user.password, input.password))) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['password'],
              message: 'Password is incorrect',
              code: 'custom',
            },
          ]),
        })
      }

      await ctx.db
        .delete(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()

      ctx.session.destroy()
    }),
)
