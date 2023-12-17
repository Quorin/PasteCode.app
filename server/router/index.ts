// src/server/router/index.ts
import { createTRPCRouter } from '@/server/router/context'
import { userRouter } from '@/server/router/user-router'
import { pasteRouter } from '@/server/router/paste-router'
import { settingsRouter } from '@/server/router/settings-router'
import { authRouter } from '@/server/router/auth-router'

export const appRouter = createTRPCRouter({
  user: userRouter,
  paste: pasteRouter,
  settings: settingsRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
