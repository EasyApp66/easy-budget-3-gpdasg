import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

/**
 * Promo codes that users can redeem for free premium access
 */
export const promoCodes = pgTable('promo_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  durationDays: integer('duration_days').notNull(), // How many days of premium access this code grants
  maxRedemptions: integer('max_redemptions'), // null = unlimited
  currentRedemptions: integer('current_redemptions').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Track which promo codes each user has redeemed
 */
export const promoCodeRedemptions = pgTable('promo_code_redemptions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  promoCodeId: text('promo_code_id')
    .notNull()
    .references(() => promoCodes.id, { onDelete: 'cascade' }),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(), // Premium expiration date for this redemption
});

/**
 * Track premium subscriptions and one-time purchases
 */
export const premiumSubscriptions = pgTable('premium_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'subscription' or 'one-time'
  provider: text('provider').notNull(), // 'apple', 'stripe', 'promo'
  transactionId: text('transaction_id').notNull(),
  amount: text('amount'), // CHF amount, nullable for promo codes
  currency: text('currency'), // 'CHF'
  status: text('status').notNull().default('active'), // 'active', 'expired', 'cancelled'
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
