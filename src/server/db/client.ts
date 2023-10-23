// src/server/db/client.ts
import { PrismaClient } from '@prisma/client'
import { env } from '../../env/server.mjs'
import { connect } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'

declare global {
  var prisma: PrismaClient | undefined
}

const connection = connect({ url: env.DATABASE_URL })
const adapter = new PrismaPlanetScale(connection)

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'production' ? [] : ['query'],
    adapter,
  })

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
