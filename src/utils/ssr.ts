import { createServerSideHelpers } from '@trpc/react-query/server'
import { AppRouter, appRouter } from '../server/router'
import { createContext } from '../server/router/context'
import superjson from 'superjson'

export const ssrHelper = async () =>
  createServerSideHelpers<AppRouter>({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })
