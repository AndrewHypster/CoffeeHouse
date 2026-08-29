import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, date, unique, } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  avatar_type: text('avatar_type'),
  mail: text('mail'),
  role: text('role').default('user').notNull(),
  createdAt: date('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  poems: many(poems),
  likes: many(likes),
}));

export const poems = pgTable('poems', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: date('created_at').defaultNow().notNull(),
});

export const poemsRelations = relations(poems, ({ one, many }) => ({
  author: one(users, {
    fields: [poems.authorId],
    references: [users.id],
  }),
  likes: many(likes),
}));

export const box = pgTable('box', {
  id: serial('id').primaryKey(),
  text: text('Текст'),
  date: date('Дата').notNull(),
});

export const likes = pgTable(
  'likes',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    poemId: integer('poem_id')
      .notNull()
      .references(() => poems.id, { onDelete: 'cascade' }),
  },
  (table) => [
    unique('user_poem_unique').on(table.userId, table.poemId),
  ]
);

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),

  poem: one(poems, {
    fields: [likes.poemId],
    references: [poems.id],
  }),
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  poemId: integer('poem_id')
    .notNull()
    .references(() => poems.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id'),
  content: text('content').notNull(),
  createdAt: date('created_at').defaultNow().notNull(),
});

export const commentsRelations = relations(
  comments,
  ({ one, many }) => ({
    author: one(users, {
      fields: [comments.authorId],
      references: [users.id],
    }),
    poem: one(poems, {
      fields: [comments.poemId],
      references: [poems.id],
    }),
    parent: one(comments, {
      fields: [comments.parentId],
      references: [comments.id],
      relationName: 'commentReplies',
    }),
    replies: many(comments, {
      relationName: 'commentReplies',
    }),
  }),
);