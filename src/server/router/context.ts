// src/server/router/context.ts
import * as trpc from '@trpc/server'
import superjson from 'superjson'

import { ZodError } from 'zod'
import { initTRPC } from '@trpc/server'
import { TRPCPanelMeta } from 'trpc-panel'
import { db } from '../../../db/db'
import { experimental_createServerActionHandler } from '@trpc/next/app-dir/server'
import { auth } from '../../auth'

export const createContext = async () => {
  const session = await auth()

  return {
    session,
    db,
  }
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

const t = initTRPC
  .meta<TRPCPanelMeta>()
  .context<Context>()
  .create({
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
    throw new trpc.TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

export const createAction = experimental_createServerActionHandler(t, {
  createContext,
})
