import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as authSchema from '../db/auth-schema.js';
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

      return {
        message: 'Account permanently deleted',
        deletedUserId: userId,
      };
    }
  );
}
