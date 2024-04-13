import { sql } from 'drizzle-orm'
import {
  pgTable,
  varchar,
  timestamp,
  index,
  boolean,
  uuid,
  text,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const confirmationCodeLength = 36

export const usersTable = pgTable(
  'user',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`uuid_generate_v7()`),
    email: varchar('email', { length: 255 }).notNull().unique(),
    acceptTerms: boolean('accept_terms').default(true).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    confirmed: boolean('confirmed').default(false).notNull(),
    credentialsUpdatedAt: timestamp('credentials_updated_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    }),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      emailIdx: index('email_idx').on(table.email),
    }
  },
)

export const confirmationCodesTable = pgTable(
  'confirmation_code',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`uuid_generate_v7()`),
    code: varchar('code', { length: confirmationCodeLength })
      .notNull()
      .unique(),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    }).notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      confirmationCodeIdx: index('confirmation_code_idx').on(table.code),
    }
  },
)

export const resetPasswordsTable = pgTable(
  'reset_password',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`uuid_generate_v7()`),
    code: varchar('code', { length: confirmationCodeLength })
      .notNull()
      .unique(),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', {
      mode: 'date',
      withTimezone: true,
      precision: 0,
    }).notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      resetPasswordIdx: index('reset_password_idx').on(table.code),
    }
  },
)

export const tagsTable = pgTable(
  'tag',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`uuid_generate_v7()`),
    name: varchar('name', { length: 32 }).notNull().unique(),
  },
  (table) => {
    return {
      tagNameIdx: index('tag_name_idx').on(table.name),
    }
  },
)

export const pastesTable = pgTable('paste', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .default(sql`uuid_generate_v7()`),
  title: varchar('title', { length: 255 }).notNull().default(''),
  content: text('content').notNull().default(''),
  password: varchar('password', { length: 255 }),
  style: varchar('style', { length: 16 }),
  description: text('description'),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: true,
    precision: 0,
  }),
  userId: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
})

export const tagsOnPastesTable = pgTable(
  'tag_on_paste',
  {
    pasteId: uuid('paste_id')
      .notNull()
      .references(() => pastesTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      pasteIdTagIdIdx: primaryKey({ columns: [table.pasteId, table.tagId] }),
      pasteIdIdx: index('paste_id_idx').on(table.pasteId),
    }
  },
)
