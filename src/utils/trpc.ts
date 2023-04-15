// src/utils/trpc.ts
import type { AppRouter } from '../server/router'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { getBaseUrl } from '../pages/_app'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }
  },
  ssr: false,
})

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
