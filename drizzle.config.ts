import type { Config } from 'drizzle-kit'

export default {
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
  driver: 'pg',
  out: './drizzle',
  schema: './db/schema.ts',
} satisfies Config
