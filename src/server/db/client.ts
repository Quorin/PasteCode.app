// src/server/db/client.ts
import { PrismaClient } from '@prisma/client'
import { env } from '../../env/server.mjs'
import { Client } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPlanetScale(new Client({ url: env.DATABASE_URL }))

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'production' ? [] : ['query'],
    adapter,
  })

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
