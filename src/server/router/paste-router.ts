import { z, ZodError } from 'zod'
import * as trpc from '@trpc/server'
import { createRouter } from './context'

export const pasteRouter = createRouter()
  .query('getPaste', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const paste = await ctx.prisma.paste.findFirst({
        where: {
          id: input.id,
        },
        select: {
          content: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
          title: true,
          style: true,
          description: true,
        },
      })

      return paste
    },
  })
  .query('getUserPastes', {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id

      if (!userId) {
        throw new trpc.TRPCError({
          code: 'UNAUTHORIZED',
        })
      }

      const limit = input.limit ?? 50

      const now = new Date()

      const pastes = await ctx.prisma.paste.findMany({
        where: {
          userId,
          expiresAt: {
            gt: now,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        distinct: ['id'],
        select: {
          id: true,
          content: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
          title: true,
          style: true,
          description: true,
        },
      })

      let nextCursor: typeof input.cursor | null = null

      if (pastes.length > limit) {
        const nextItem = pastes.pop()
        nextCursor = nextItem!.id
      }

      return { pastes, nextCursor }
    },
  })
