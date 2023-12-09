import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'

import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { max: 1 })

const db = drizzle(sql)

migrate(db, { migrationsFolder: 'drizzle' })
  .then(() => {
    console.log('Migration complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Migration failed', err)
    process.exit(1)
  })
