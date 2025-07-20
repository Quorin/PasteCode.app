import { router } from '@/lib/router'
import { onError, ORPCError } from '@orpc/client'
import { ValidationError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { z } from 'zod'

const handler = new RPCHandler(router, {
  clientInterceptors: [
    onError((error) => {
      if (
        error instanceof ORPCError &&
        error.code === 'BAD_REQUEST' &&
        error.cause instanceof ValidationError
      ) {
        const zodError = new z.ZodError(
          error.cause.issues as z.core.$ZodIssue[],
        )

        throw new ORPCError('BAD_REQUEST', {
          status: 422,
          message: z.prettifyError(zodError),
          data: z.flattenError(zodError).fieldErrors,
          cause: error.cause,
        })
      }
    }),
  ],
})
async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {},
  })

  return response ?? new Response('Not found', { status: 404 })
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
