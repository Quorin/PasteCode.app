import { z } from 'zod'
import * as trpc from '@trpc/server'
import { createRouter } from './context'
import * as argon2 from 'argon2'
import Cryptr from 'cryptr'
import { getExpirationDate, upsertTags } from '../../utils/paste'

export const pasteRouter = createRouter()
  .mutation('updatePaste', {
    input: z.object({
      id: z.string(),
      title: z.string().max(150, 'Title is too long'),
      content: z.string().max(10000000, 'Content is too long'),
      style: z.string(),
      description: z.string().max(300, 'Description is too long'),
      tags: z
        .array(z.string().max(15, 'Too long name'))
        .max(20, 'Too many tags')
        .optional(),
      expiration: z
        .enum(['same', 'never', 'year', 'month', 'week', 'day', 'hour', '10m'])
        .default('never'),
      currentPassword: z.string().optional(),
      password: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const paste = await ctx.prisma.paste.findFirst({
        where: {
          id: input.id,
        },
        include: {
          tags: true,
        },
      })

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
          const valid = await argon2.verify(
            paste.password,
            input.currentPassword,
          )
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

      await ctx.prisma.paste.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.password
            ? new Cryptr(input.password).encrypt(input.content)
            : input.content,
          style: input.style,
          description: input.description,
          expiresAt: getExpirationDate(input.expiration, paste.expiresAt),
          password: input.password ? await argon2.hash(input.password) : null,
        },
      })

      await upsertTags(ctx.prisma, input.tags, input.id)
    },
  })
  .mutation('createPaste', {
    input: z.object({
      title: z.string().max(150, 'Title is too long'),
      content: z.string().max(10000000, 'Content is too long'),
      style: z.string(),
      description: z.string().max(300, 'Description is too long'),
      tags: z
        .array(z.string().max(15, 'Too long name'))
        .max(20, 'Too many tags')
        .optional(),
      expiration: z
        .enum(['never', 'year', 'month', 'week', 'day', 'hour', '10m'])
        .default('never'),
      password: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const paste = await ctx.prisma.paste.create({
        data: {
          title: input.title,
          content: input.password
            ? new Cryptr(input.password).encrypt(input.content)
            : input.content,
          style: input.style,
          description: input.description,
          expiresAt: getExpirationDate(input.expiration),
          password: input.password ? await argon2.hash(input.password) : null,
          user: ctx.session?.user?.id
            ? {
                connect: {
                  id: ctx.session?.user?.id,
                },
              }
            : undefined,
        },
      })

      await upsertTags(ctx.prisma, input.tags, paste.id)

      return paste.id
    },
  })
  .query('getPaste', {
    input: z.object({
      id: z.string(),
      password: z.string().nullable(),
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
          password: true,
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
          userId: true,
        },
      })

      if (paste && paste.password) {
        if (input.password) {
          const valid = await argon2.verify(paste.password, input.password)

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
          createdAt: true,
          expiresAt: true,
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
