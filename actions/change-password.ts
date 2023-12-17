'use server'

import { eq } from 'drizzle-orm'
import { usersTable } from '@/db/schema'
import { createAction, protectedProcedure } from '@/server/router/context'
import { changePasswordSchema } from '@/server/router/schema'
import { TRPCError } from '@trpc/server'
import { hash, verify } from 'argon2'
import { ZodError } from 'zod'

export const changePasswordAction = createAction(
  protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .limit(1)
        .execute()

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        })
      }

      if (!(await verify(user.password, input.currentPassword))) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['currentPassword'],
              message: 'Current password is incorrect',
              code: 'custom',
            },
          ]),
        })
      }

      await ctx.db
        .update(usersTable)
        .set({
          password: await hash(input.password),
          credentialsUpdatedAt: new Date(),
        })
        .where(eq(usersTable.id, ctx.session.user.id))
        .execute()

      ctx.session.destroy()
    }),
)
