/**
 * Central environment configuration.
 *
 * All process.env access lives here. Import `env` instead of reading
 * process.env directly anywhere in the app. This makes the full set of
 * required/optional variables visible in one place and gives early startup
 * errors when something critical is missing.
 */
import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(
      `[config] Missing required environment variable: ${key}\n` +
      `  Copy .env.example → .env and fill in the value.`
    );
  }
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  nodeEnv:        optional('NODE_ENV', 'development'),
  isDev:          optional('NODE_ENV', 'development') !== 'production',
  port:           parseInt(optional('PORT', '3001'), 10),
  anthropicApiKey: required('ANTHROPIC_API_KEY'),
  /**
   * Allowed CORS origin for the API.
   * - Development: default '*' (open, fine for local mobile testing)
   * - Production: set CLIENT_ORIGIN to your domain, e.g. https://daily60.app
   *   For a mobile-only backend you can also keep '*' in prod — CORS is only
   *   enforced by browsers, not by native app HTTP clients.
   */
  clientOrigin:   optional('CLIENT_ORIGIN', '*'),

  /**
   * Postgres connection string for usage-quota + entitlement storage.
   * Empty = quota system is INERT (middleware passes through). This is the
   * feature flag: the backend runs identically to before until a DB is set.
   */
  databaseUrl:    optional('DATABASE_URL', ''),

  /**
   * RevenueCat secret API key for server-side entitlement verification
   * (Phase A: REST lookup by appUserId; Phase B: webhook reconciliation).
   * Empty = backend treats every user as free tier.
   */
  revenueCatApiKey: optional('REVENUECAT_API_KEY', ''),

  /**
   * Static bearer token that mobile clients must send in every request:
   *   Authorization: Bearer <API_SECRET>
   *
   * This is a deterrent against casual unauthorized use — it is NOT a
   * true security control because EXPO_PUBLIC_API_SECRET is visible in
   * the compiled app bundle. True security requires user authentication
   * (JWT / OAuth). In development this defaults to a dummy value so the
   * server starts without requiring the variable to be set.
   *
   * IMPORTANT: Set a strong random value in production .env and ensure
   * the same value is in mobile EXPO_PUBLIC_API_SECRET.
   */
  apiSecret:      optional('API_SECRET', ''),
} as const;
