import { pgTable, text, timestamp, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user']);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: roleEnum('role').default('user').notNull(),
    isApproved: boolean('is_approved').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const workspaces = pgTable('workspaces', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { vector } from 'drizzle-orm/pg-core';

export const documentChunks = pgTable('document_chunks', {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }), // 768 for Gemini text-embedding-004
});
