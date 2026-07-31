import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';



export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  mail: text('mail'),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const poems = pgTable('poems', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  poems: many(poems),
}));

export const poemsRelations = relations(poems, ({ one }) => ({
  author: one(users, {
    fields: [poems.authorId],
    references: [users.id],
  }),
}));