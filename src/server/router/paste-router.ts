import { z } from 'zod'
import * as trpc from '@trpc/server'
import { createRouter } from './context'
import dayjs from 'dayjs'
import { Maybe } from '@trpc/server'

export const pasteRouter = createRouter()
  .mutation('createPaste', {
    input: z.object({
      title: z.string().max(150, 'Title is too long'),
      content: z.string().max(10000000, 'Content is too long'),
      style: z.string(),
      description: z.string().max(10000, 'Description is too long'),
      tags: z
        .array(z.string().max(15, 'Too long name'))
        .max(20, 'Too many tags')
        .optional(),
      expiration: z
        .enum(['never', 'year', 'month', 'week', 'day', 'hour', '10m'])
        .default('never'),
    }),
    async resolve({ input, ctx }) {
      const expiresAt: () => Maybe<Date> = () => {
        switch (input.expiration) {
          case 'year':
            return dayjs().add(1, 'year').toDate()
          case 'month':
            return dayjs().add(1, 'month').toDate()
          case 'week':
            return dayjs().add(1, 'week').toDate()
          case 'day':
            return dayjs().add(1, 'day').toDate()
          case 'hour':
            return dayjs().add(1, 'hour').toDate()
          case '10m':
            return dayjs().add(10, 'minute').toDate()
          default:
            return undefined
        }
      }

      const paste = await ctx.prisma.paste.create({
        data: {
          title: input.title,
          content: input.content,
          style: input.style,
          description: input.description,
          expiresAt: expiresAt(),
          user: ctx.session?.user?.id
            ? {
                connect: {
                  id: ctx.session?.user?.id,
                },
              }
            : undefined,
        },
      })

      if (input.tags && input.tags.length > 0) {
        await ctx.prisma.tag.createMany({
          data:
            input.tags?.map((tag) => ({
              name: tag.toLowerCase(),
            })) || [],
          skipDuplicates: true,
        })

        const tags = await ctx.prisma.tag.findMany({
          where: {
            name: { in: input.tags.map((t) => t.toLowerCase()) || [] },
          },
        })

        await ctx.prisma.tagsOnPastes.createMany({
          skipDuplicates: true,
          data: tags.map((tag) => ({ pasteId: paste.id, tagId: tag.id })),
        })
      }

      return paste.id
    },
  })
  .query('getPaste', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const now = new Date()

      const paste = await ctx.prisma.paste.findFirst({
        where: {
          id: input.id,
          OR: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                gt: now,
              },
            },
          ],
        },
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
          createdAt: true,
          expiresAt: true,
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
          OR: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                gt: now,
              },
            },
          ],
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
