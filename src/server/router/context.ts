// src/server/router/context.ts
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { getIronSession } from 'iron-session'
import { sessionOptions } from '../auth/config'
import superjson from 'superjson'

import { prisma } from '../db/client'
import { ZodError } from 'zod'
import { initTRPC } from '@trpc/server'
import { TRPCPanelMeta } from 'trpc-panel'

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions,
) => {
  const req = opts?.req
  const res = opts?.res

  const session = req && res && (await getIronSession(req, res, sessionOptions))

  return {
    req,
    res,
    session,
    prisma,
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
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
