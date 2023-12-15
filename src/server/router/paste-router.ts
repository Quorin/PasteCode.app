import { z } from 'zod'
import * as trpc from '@trpc/server'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from './context'
import { verify, hash } from 'argon2'
import Cryptr from 'cryptr'
import { getExpirationDate, upsertTagsOnPaste } from '../../utils/paste'
import {
  createPasteSchema,
  getPasteSchema,
  removePasteSchema,
  updatePasteSchema,
} from './schema'
import { pastesTable, tagsTable, tagsOnPastesTable } from '../../../db/schema'
import { and, desc, eq, gt, gte, isNull, or, sql } from 'drizzle-orm'

export const pasteRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(removePasteSchema)
    .mutation(async ({ input, ctx }) => {
      const [paste] = await ctx.db
        .select({
          id: pastesTable.id,
          userId: pastesTable.userId,
          password: pastesTable.password,
        })
        .from(pastesTable)
        .where(eq(pastesTable.id, input.id))
        .limit(1)
        .execute()

      if (!paste) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Paste not found',
        })
      }

      if (paste.userId !== ctx.session.user.id) {
        throw new trpc.TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to remove this paste',
        })
      }

      if (paste.password) {
        if (input.password) {
          const valid = await verify(paste.password, input.password)
          if (!valid) {
            throw new trpc.TRPCError({
              code: 'BAD_REQUEST',
              message: 'Password is incorrect',
            })
          }
        } else {
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password is required',
          })
        }
      }

      await ctx.db
        .delete(pastesTable)
        .where(eq(pastesTable.id, input.id))
        .execute()
    }),
  update: protectedProcedure
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
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Paste not found',
        })
      }

      if (paste.userId !== ctx.session?.user?.id) {
        throw new trpc.TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to edit this paste',
        })
      }

      if (paste.password) {
        if (input.currentPassword) {
          const valid = await verify(paste.password, input.currentPassword)
          if (!valid) {
            throw new trpc.TRPCError({
              code: 'BAD_REQUEST',
              message: 'Password is incorrect',
            })
          }
        } else {
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password is required',
          })
        }
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
    }),
  create: publicProcedure
    .input(createPasteSchema)
    .mutation(async ({ input, ctx }) => {
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
  get: publicProcedure.input(getPasteSchema).query(async ({ input, ctx }) => {
    const [paste] = await ctx.db
      .select({
        id: pastesTable.id,
        content: pastesTable.content,
        password: pastesTable.password,
        tags: sql<
          string[]
        >`coalesce(array_agg(${tagsTable.name}) filter (where ${tagsTable.name} is not null), '{}')`,
        title: pastesTable.title,
        style: pastesTable.style,
        description: pastesTable.description,
        createdAt: pastesTable.createdAt,
        expiresAt: pastesTable.expiresAt,
        userId: pastesTable.userId,
      })
      .from(pastesTable)
      .where(
        and(
          eq(pastesTable.id, input.id),
          or(
            isNull(pastesTable.expiresAt),
            gte(pastesTable.expiresAt, sql`now()`),
          ),
        ),
      )
      .leftJoin(tagsOnPastesTable, eq(tagsOnPastesTable.pasteId, input.id))
      .leftJoin(tagsTable, eq(tagsTable.id, tagsOnPastesTable.tagId))
      .groupBy(pastesTable.id)
      .limit(1)
      .execute()

    if (paste && paste.password) {
      if (input.password) {
        const valid = await verify(paste.password, input.password)

        if (valid) {
          return {
            paste: {
              ...paste,
              content: new Cryptr(input.password).decrypt(paste.content),
            },
            secure: false,
          }
        }
      }

      paste.content = ''
      paste.password = ''

      return { paste, secure: true }
    }

    return { paste, secure: false }
  }),
  getUserPastes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50

      const pastes = await ctx.db
        .select({
          id: pastesTable.id,
          createdAt: pastesTable.createdAt,
          expiresAt: pastesTable.expiresAt,
          tags: sql<
            string[]
          >`coalesce(array_agg(${tagsTable.name}) filter (where ${tagsTable.name} is not null), '{}')`,

          title: pastesTable.title,
          style: pastesTable.style,
          description: pastesTable.description,
        })
        .from(pastesTable)
        .where(
          and(
            eq(pastesTable.userId, ctx.session.user.id),
            or(
              isNull(pastesTable.expiresAt),
              gte(pastesTable.expiresAt, sql`now()`),
            ),
            input.cursor ? gt(pastesTable.id, input.cursor) : undefined,
          ),
        )
        .leftJoin(
          tagsOnPastesTable,
          eq(tagsOnPastesTable.pasteId, pastesTable.id),
        )
        .leftJoin(tagsTable, eq(tagsTable.id, tagsOnPastesTable.tagId))
        .orderBy(desc(pastesTable.createdAt))
        .groupBy(pastesTable.id)
        .limit(limit + 1)
        .execute()

      let nextCursor: typeof input.cursor | null = null

      if (pastes.length > limit) {
        const nextItem = pastes.pop()
        nextCursor = nextItem!.id
      }

      return { pastes, nextCursor }
    }),
})
