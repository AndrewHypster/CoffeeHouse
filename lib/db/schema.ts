import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const poems = pgTable('poems', {
  id: serial('id').primaryKey(),
  author: text('author'),
  title: text('title'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});