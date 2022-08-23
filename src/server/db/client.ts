// src/server/db/client.ts
import { PrismaClient } from '@prisma/client'
import { env } from '../../env/server.mjs'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'production' ? [] : ['query'],
  })

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
