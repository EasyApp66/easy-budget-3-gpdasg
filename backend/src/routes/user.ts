import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gt, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as authSchema from '../db/auth-schema.js';
import * as appSchema from '../db/schema.js';
import type { App } from '../index.js';

export function registerUserRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * GET /api/user/profile
   * Get current user's profile information
   * Protected route - requires authentication
   */
  app.fastify.get(
    '/api/user/profile',
    {
      schema: {
        description: 'Get current user profile',
        tags: ['user'],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              premiumStatus: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const user = await app.db
        .select()
        .from(authSchema.user)
        .where(eq(authSchema.user.id, session.user.id))
        .limit(1);

      if (!user || user.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        premiumStatus: user[0].premiumStatus,
        emailVerified: user[0].emailVerified,
        createdAt: user[0].createdAt.toISOString(),
        updatedAt: user[0].updatedAt.toISOString(),
      };
    }
  );

  /**
   * PATCH /api/user/profile
   * Update user profile (name and settings)
   * Protected route - requires authentication
   */
  app.fastify.patch(
    '/api/user/profile',
    {
      schema: {
        description: 'Update user profile',
        tags: ['user'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'User full name' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              premiumStatus: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const body = request.body as { name?: string };

      // Validate input
      if (body.name !== undefined && typeof body.name !== 'string') {
        return reply.status(400).send({ error: 'Name must be a string' });
      }

      const updateData: { name?: string } = {};
      if (body.name !== undefined) {
        updateData.name = body.name;
      }

      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({ error: 'No fields to update' });
      }

      const updated = await app.db
        .update(authSchema.user)
        .set(updateData)
        .where(eq(authSchema.user.id, session.user.id))
        .returning();

      if (!updated || updated.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return {
        id: updated[0].id,
        email: updated[0].email,
        name: updated[0].name,
        premiumStatus: updated[0].premiumStatus,
        emailVerified: updated[0].emailVerified,
        createdAt: updated[0].createdAt.toISOString(),
        updatedAt: updated[0].updatedAt.toISOString(),
      };
    }
  );

  /**
   * GET /api/user/premium-status
   * Get user's premium status and active subscriptions
   * Protected route - requires authentication
   */
  app.fastify.get(
    '/api/user/premium-status',
    {
      schema: {
        description: 'Get user premium status and active subscriptions',
        tags: ['premium'],
        response: {
          200: {
            type: 'object',
            properties: {
              isPremium: { type: 'boolean' },
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

      const subscriptionsResponse = activeSubscriptions.map((sub) => {
        const expiresAt = new Date(sub.expiresAt);
        const daysRemaining = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: sub.id,
          type: sub.type,
          provider: sub.provider,
          expiresAt: expiresAt.toISOString(),
          daysRemaining,
          status: sub.status,
        };
      });

      app.logger.info(
        { userId, isPremium, subscriptionCount: subscriptionsResponse.length },
        'Premium status retrieved'
      );

      return {
        isPremium,
        activeSubscriptions: subscriptionsResponse,
      };
    }
  );

  /**
   * POST /api/user/redeem-promo
   * Redeem a promo code to grant premium access
   * Protected route - requires authentication
   */
  app.fastify.post(
    '/api/user/redeem-promo',
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

  /**
   * DELETE /api/user/account
   * Permanently delete the user account and all associated data
   * Protected route - requires authentication
   * This action cannot be undone
   */
  app.fastify.delete(
    '/api/user/account',
    {
      schema: {
        description: 'Permanently delete user account and all associated data',
        tags: ['user'],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              deletedUserId: { type: 'string' },
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

      const userId = session.user.id;

      // Verify user exists before deleting
      const userExists = await app.db
        .select()
        .from(authSchema.user)
        .where(eq(authSchema.user.id, userId))
        .limit(1);

      if (!userExists || userExists.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Delete user - cascade rules will handle deletion of sessions, accounts, verifications
      await app.db
        .delete(authSchema.user)
        .where(eq(authSchema.user.id, userId));

      app.logger.info({ deletedUserId: userId }, 'User account permanently deleted');

      return {
        message: 'Account permanently deleted',
        deletedUserId: userId,
      };
    }
  );
}
