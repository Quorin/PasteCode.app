'use server'

import { and, eq } from 'drizzle-orm'
import { resetPasswordsTable, usersTable } from '@/db/schema'
import { createAction, publicProcedure } from '@/server/trpc/context'
import { resetPasswordConfirmationSchema } from '@/server/trpc/schema'
import { hash } from 'argon2'
import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import dayjs from 'dayjs'

export const resetPasswordConfirmationAction = createAction(
  publicProcedure
    .input(resetPasswordConfirmationSchema)
    .mutation(async ({ ctx, input }) => {
      const [rp] = await ctx.db
        .select({
          id: resetPasswordsTable.id,
          userId: resetPasswordsTable.userId,
          code: resetPasswordsTable.code,
          expiresAt: resetPasswordsTable.expiresAt,
          user: {
            id: usersTable.id,
          },
        })
        .from(resetPasswordsTable)
        .innerJoin(usersTable, eq(usersTable.id, resetPasswordsTable.userId))
        .where(
          and(
            eq(resetPasswordsTable.id, input.id),
            eq(resetPasswordsTable.code, input.code),
          ),
        )
        .limit(1)
        .execute()

      if (!rp || dayjs().isAfter(rp.expiresAt)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {
              path: ['password'],
              message: 'Code is incorrect or expired',
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
        .where(eq(usersTable.id, rp.userId))
        .execute()

      await ctx.db
        .delete(resetPasswordsTable)
        .where(eq(resetPasswordsTable.id, rp.id))
        .execute()
    }),
)
