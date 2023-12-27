import { createTRPCRouter } from '@/server/router/context'
export const appRouter = createTRPCRouter({})

// export type definition of API
export type AppRouter = typeof appRouter
