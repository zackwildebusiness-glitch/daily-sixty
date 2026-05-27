/**
 * API configuration.
 *
 * All backend URL logic lives here. Nothing else in the app should construct
 * or hardcode URLs — import from this module instead.
 *
 * Environment variables:
 *   EXPO_PUBLIC_API_URL — override the API base URL at build time.
 *                         Expo SDK 56 exposes EXPO_PUBLIC_* vars to the JS
 *                         bundle automatically (no extra package needed).
 *
 * Default behaviour:
 *   __DEV__ === true  → http://10.0.2.2:3001  (Android emulator → host localhost)
 *   __DEV__ === false → EXPO_PUBLIC_API_URL    (must be set for production builds)
 *
 * Physical device in development?
 *   Create mobile/.env.local and set:
 *     EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
 */

const EMULATOR_URL = 'http://10.0.2.2:3001';

// EXPO_PUBLIC_* vars are inlined at bundle time by Metro
const envUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL: string = envUrl ?? (__DEV__ ? EMULATOR_URL : '');

if (!API_BASE_URL && !__DEV__) {
  // Surface a clear error at app start rather than silent fetch failures
  console.error('[config] EXPO_PUBLIC_API_URL is not set. API calls will fail.');
}

/** Typed path constants — change route paths here, not scattered across screens. */
export const API_PATHS = {
  generatePlan:     '/api/plan/generate',
  todayAction:      '/api/action/today',
  adjustAction:     '/api/action/adjust',
  weeklyReflection: '/api/reflection/weekly',
} as const;

/**
 * Static API secret sent as `Authorization: Bearer <secret>` on every request.
 *
 * Set EXPO_PUBLIC_API_SECRET in your .env / .env.local to match the
 * API_SECRET value in the backend .env. If unset (development default),
 * the Authorization header is omitted and the backend allows the request
 * through (backend also skips the check when API_SECRET is empty).
 *
 * WARNING: EXPO_PUBLIC_* vars are compiled into the app bundle and are
 * visible to anyone who decompiles the APK. This is a cost-protection
 * deterrent only — not a user authentication mechanism.
 */
export const API_SECRET: string = process.env.EXPO_PUBLIC_API_SECRET ?? '';
