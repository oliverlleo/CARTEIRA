import {
  boolean,
  char,
  date,
  index,
  integer,
  numeric,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const neonAuth = pgSchema('neon_auth');
export const authUsers = neonAuth.table('user', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => authUsers.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  timezone: text('timezone').notNull().default('America/Sao_Paulo'),
  currency: char('currency', { length: 3 }).notNull().default('BRL'),
  isShared: boolean('is_shared').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
}, (t) => [uniqueIndex('wallet_owner_slug_idx').on(t.ownerId, t.slug)]);

export const walletMembers = pgTable('wallet_members', {
  walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
});

export const financialAccounts = pgTable('financial_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  accountType: text('account_type').notNull(),
  currency: char('currency', { length: 3 }).notNull().default('BRL'),
  openingBalance: numeric('opening_balance', { precision: 19, scale: 4 }).notNull().default('0'),
  openingBalanceDate: date('opening_balance_date').notNull(),
  hideBalance: boolean('hide_balance').notNull().default(false),
  createdBy: uuid('created_by').notNull().references(() => authUsers.id),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
}, (t) => [index('financial_accounts_wallet_idx').on(t.walletId)]);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  name: text('name').notNull(),
  appliesTo: text('applies_to').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdBy: uuid('created_by').notNull().references(() => authUsers.id),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => financialAccounts.id),
  kind: text('kind').notNull(),
  direction: text('direction').notNull(),
  status: text('status').notNull(),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
  description: text('description').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  occurredOn: date('occurred_on').notNull(),
  dueOn: date('due_on'),
  notes: text('notes'),
  source: text('source').notNull().default('manual'),
  idempotencyKey: text('idempotency_key'),
  createdBy: uuid('created_by').notNull().references(() => authUsers.id),
  updatedBy: uuid('updated_by').notNull().references(() => authUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [
  index('transactions_wallet_date_idx').on(t.walletId, t.occurredOn),
  uniqueIndex('transactions_wallet_idempotency_idx').on(t.walletId, t.idempotencyKey),
]);
