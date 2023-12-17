import { TRPCError, inferAsyncReturnType } from '@trpc/server'
import superjson from 'superjson'

import { ZodError } from 'zod'
import { initTRPC } from '@trpc/server'
import { db } from '@/db/db'
import { experimental_createServerActionHandler } from '@trpc/next/app-dir/server'
import { auth } from '@/utils/auth'

export const createContext = async () => {
  const session = await auth()

  return {
    session,
    db,
  }
}

type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      session: {
        ...ctx.session,
        user: {
          ...ctx.session.user,
        },
      },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

export const createAction = experimental_createServerActionHandler(t, {
  createContext,
})
