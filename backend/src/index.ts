import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerUserRoutes } from './routes/user.js';
import { registerPremiumRoutes } from './routes/premium.js';

// Combine schemas for full database type support
const schema = { ...appSchema, ...authSchema };

// Create application with combined schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication with email/password and social OAuth providers
// Google and Apple OAuth are handled automatically via proxy
app.withAuth();

// Register routes - add your route modules here
// IMPORTANT: Always use registration functions to avoid circular dependency issues
registerUserRoutes(app);
registerPremiumRoutes(app);

await app.run();
app.logger.info('Application running');
