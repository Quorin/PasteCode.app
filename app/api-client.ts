'use client'

import { loggerLink } from '@trpc/client'
import {
  experimental_createActionHook,
  experimental_serverActionLink,
} from '@trpc/next/app-dir/client'
import superjson from 'superjson'

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

export const useAction = experimental_createActionHook({
  links: [
    loggerLink({
      enabled: (opts) =>
        (process.env.NODE_ENV === 'development' &&
          typeof window !== 'undefined') ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    experimental_serverActionLink(),
  ],
  transformer: superjson,
})
