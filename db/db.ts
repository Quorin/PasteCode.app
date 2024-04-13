import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.POSTGRES_URL!)

export const db = drizzle(sql, {
  logger: process.env.NODE_ENV !== 'production',
})
