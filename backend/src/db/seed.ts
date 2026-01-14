/**
 * Seed script to initialize default promo codes
 * Run with: npm run seed
 */

import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as appSchema from './schema.js';
import { randomUUID } from 'crypto';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(databaseUrl);

const db = drizzle(client);

async function seed() {
  try {
    console.log('Starting seed process...');

    // Check if EASY2 promo code already exists
    const existing = await db
      .select()
      .from(appSchema.promoCodes)
      .where(sql`code = 'EASY2'`)
      .limit(1);

    if (existing.length > 0) {
      console.log('EASY2 promo code already exists, skipping...');
      return;
    }

    // Create default promo code EASY2
    // 30 days of premium access, unlimited redemptions
    const promoId = randomUUID();
    await db.insert(appSchema.promoCodes).values({
      id: promoId,
      code: 'EASY2',
      durationDays: 30,
      maxRedemptions: null, // unlimited
      currentRedemptions: 0,
    });

    console.log('✅ Successfully seeded default promo code: EASY2 (30 days premium)');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
