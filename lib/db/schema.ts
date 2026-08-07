import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, date } from 'drizzle-orm/pg-core';



export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  mail: text('mail'),
  role: text('role').default('user').notNull(),
  createdAt: date('created_at').defaultNow().notNull(),
});

export const poems = pgTable('poems', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: date('created_at').defaultNow().notNull(),
});

export const box = pgTable('box', {
  id: serial('id').primaryKey(),
  text: text('Текст'),
  date: date('Дата').notNull(),
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