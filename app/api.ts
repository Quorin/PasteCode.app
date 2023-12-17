import { loggerLink } from '@trpc/client'
import { experimental_nextCacheLink } from '@trpc/next/app-dir/links/nextCache'
import { experimental_createTRPCNextAppDirServer } from '@trpc/next/app-dir/server'
import SuperJSON from 'superjson'
import { AppRouter, appRouter } from '@/server/router'
import { createContext } from '@/server/router/context'

export const apiInvoker = experimental_createTRPCNextAppDirServer<AppRouter>({
  config() {
    return {
      transformer: SuperJSON,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        experimental_nextCacheLink({
          revalidate: 5,
          router: appRouter,
          createContext,
        }),
      ],
    }
  },
})
