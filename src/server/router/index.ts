// src/server/router/index.ts
import { createTRPCRouter } from './context'
import { userRouter } from './user-router'
import { pasteRouter } from './paste-router'
import { settingsRouter } from './settings-router'
import { authRouter } from './auth-router'

export const appRouter = createTRPCRouter({
  user: userRouter,
  paste: pasteRouter,
  settings: settingsRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
