import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gt, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as authSchema from '../db/auth-schema.js';
import * as appSchema from '../db/schema.js';
import type { App } from '../index.js';

export function registerPremiumRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * GET /api/premium/status
   * Get user's premium status and active subscriptions
   * Protected route - requires authentication
   */
  app.fastify.get(
    '/api/premium/status',
    {
      schema: {
        description: 'Get user premium status and active subscriptions',
        tags: ['premium'],
        response: {
          200: {
            type: 'object',
            properties: {
              isPremium: { type: 'boolean' },
              expiresAt: { type: 'string' },
              daysRemaining: { type: 'number' },
              isLifetime: { type: 'boolean' },
              activeSubscriptions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    provider: { type: 'string' },
                    expiresAt: { type: 'string' },
                    daysRemaining: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const userId = session.user.id;
      const now = new Date();

      // Get active subscriptions
      const activeSubscriptions = await app.db
        .select()
        .from(appSchema.premiumSubscriptions)
        .where(
          and(
            eq(appSchema.premiumSubscriptions.userId, userId),
            gt(appSchema.premiumSubscriptions.expiresAt, now),
            eq(appSchema.premiumSubscriptions.status, 'active')
          )
        )
        .orderBy(desc(appSchema.premiumSubscriptions.expiresAt));

      const isPremium = activeSubscriptions.length > 0;

      // Get the earliest expiration date
      let expiresAt: string | undefined;
      let daysRemaining: number | undefined;
      let isLifetime = false;

      if (activeSubscriptions.length > 0) {
        // Sort to get the latest expiration (premium is valid until all subscriptions expire)
        const latestSub = activeSubscriptions[0];
        const expiresAtDate = new Date(latestSub.expiresAt);
        expiresAt = expiresAtDate.toISOString();
        daysRemaining = Math.ceil(
          (expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      const subscriptionsResponse = activeSubscriptions.map((sub) => {
        const subExpiresAt = new Date(sub.expiresAt);
        const subDaysRemaining = Math.ceil(
          (subExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: sub.id,
          type: sub.type,
          provider: sub.provider,
          expiresAt: subExpiresAt.toISOString(),
          daysRemaining: subDaysRemaining,
          status: sub.status,
        };
      });

      app.logger.info(
        { userId, isPremium, subscriptionCount: subscriptionsResponse.length },
        'Premium status retrieved'
      );

      return {
        isPremium,
        expiresAt,
        daysRemaining,
        isLifetime,
        activeSubscriptions: subscriptionsResponse,
      };
    }
  );

  /**
   * POST /api/premium/redeem-code
   * Redeem a promo code to grant premium access
   * Protected route - requires authentication
   */
  app.fastify.post(
    '/api/premium/redeem-code',
    {
      schema: {
        description: 'Redeem a promo code for premium access',
        tags: ['premium'],
        body: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string', description: 'Promo code to redeem' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              expiresAt: { type: 'string' },
              daysRemaining: { type: 'number' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const body = request.body as { code?: string };
      const userId = session.user.id;

      if (!body.code || typeof body.code !== 'string') {
        return reply.status(400).send({ error: 'Code is required' });
      }

      const code = body.code.trim().toUpperCase();

      // Find promo code
      const promoCode = await app.db
        .select()
        .from(appSchema.promoCodes)
        .where(eq(appSchema.promoCodes.code, code))
        .limit(1);

      if (!promoCode || promoCode.length === 0) {
        app.logger.warn({ userId, code }, 'Invalid promo code attempt');
        return reply.status(404).send({ error: 'Promo code not found' });
      }

      const promo = promoCode[0];

      // Check if user has already redeemed this code
      const existingRedemption = await app.db
        .select()
        .from(appSchema.promoCodeRedemptions)
        .where(
          and(
            eq(appSchema.promoCodeRedemptions.userId, userId),
            eq(appSchema.promoCodeRedemptions.promoCodeId, promo.id)
          )
        )
        .limit(1);

      if (existingRedemption && existingRedemption.length > 0) {
        app.logger.warn(
          { userId, promoCodeId: promo.id },
          'User already redeemed this promo code'
        );
        return reply
          .status(400)
          .send({ error: 'You have already redeemed this promo code' });
      }

      // Check redemption limit
      if (
        promo.maxRedemptions !== null &&
        promo.currentRedemptions >= promo.maxRedemptions
      ) {
        app.logger.warn(
          { promoCodeId: promo.id },
          'Promo code redemption limit reached'
        );
        return reply
          .status(400)
          .send({ error: 'This promo code has reached its redemption limit' });
      }

      // Calculate expiration date
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + promo.durationDays * 24 * 60 * 60 * 1000
      );

      // Create redemption record
      const redemptionId = randomUUID();
      await app.db.insert(appSchema.promoCodeRedemptions).values({
        id: redemptionId,
        userId,
        promoCodeId: promo.id,
        expiresAt,
      });

      // Create premium subscription record
      const subscriptionId = randomUUID();
      await app.db.insert(appSchema.premiumSubscriptions).values({
        id: subscriptionId,
        userId,
        type: 'subscription',
        provider: 'promo',
        transactionId: redemptionId,
        status: 'active',
        expiresAt,
      });

      // Update current redemptions count
      await app.db
        .update(appSchema.promoCodes)
        .set({ currentRedemptions: promo.currentRedemptions + 1 })
        .where(eq(appSchema.promoCodes.id, promo.id));

      const daysRemaining = promo.durationDays;

      app.logger.info(
        { userId, promoCodeId: promo.id, daysRemaining },
        'Promo code successfully redeemed'
      );

      return {
        success: true,
        message: `Premium access granted for ${promo.durationDays} days`,
        expiresAt: expiresAt.toISOString(),
        daysRemaining,
      };
    }
  );
}
