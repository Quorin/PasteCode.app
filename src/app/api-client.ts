'use client'

import { loggerLink } from '@trpc/client'
import {
  experimental_createActionHook,
  experimental_createTRPCNextAppDirClient,
  experimental_serverActionLink,
} from '@trpc/next/app-dir/client'
import { experimental_nextHttpLink } from '@trpc/next/app-dir/links/nextHttp'
import superjson from 'superjson'
import { AppRouter } from '../server/router'

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''
  }

  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    return `https://${process.env.APP_URL}`
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export const api = experimental_createTRPCNextAppDirClient<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        experimental_nextHttpLink({
          batch: true,
          url: getBaseUrl(),
          headers() {
            return {
              'x-trpc-source': 'client',
            }
          },
        }),
      ],
    }
  },
})

export const useAction = experimental_createActionHook({
  links: [loggerLink(), experimental_serverActionLink()],
  transformer: superjson,
})
