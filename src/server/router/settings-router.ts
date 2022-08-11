import { z, ZodError } from 'zod'
import { createProtectedRouter } from './protected-router'
import * as trpc from '@trpc/server'

export const settingsRouter = createProtectedRouter().mutation('changeName', {
  input: z.object({
    name: z.string().max(24, 'Name must be shorter or equal 24'),
  }),
  async resolve({ input, ctx }) {
    const exists = await ctx.prisma.user.findFirst({
      where: { id: input.name },
      select: { id: true },
    })

    if (exists) {
      throw new trpc.TRPCError({
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

    await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: { name: input.name },
    })
  },
})
