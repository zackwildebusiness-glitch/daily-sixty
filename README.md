# Daily 60

Daily 60 is a mobile goal-planning app that turns a personal goal into focused daily actions. Users choose a goal, receive a structured seven-step plan, complete one daily action, and track streaks and progress over time.

## Architecture

```text
Expo mobile app -> Express API -> Claude API
       |              |
       |              +-- Zod validation, rate limiting, API-key guard
       |
       +-- MMKV device storage, Zustand state, Expo Router navigation
```

The app uses a backend even though the client is mobile-first because the AI provider key must not ship in the app bundle. The API owns prompt construction, response parsing, schema validation, token settings, rate limiting, and fallback boundaries. The mobile app sends sanitized goal context and receives only product-level plan/action data.

## Stack

- Expo SDK 56 and React Native
- Expo Router for file-based navigation
- Zustand with MMKV persistence
- Node, Express, and TypeScript backend
- Zod validation for AI responses
- Vitest coverage for parsing, quota behavior, install IDs, and streak logic
- Google Play metadata under `mobile/fastlane/metadata/android/en-US`

## Project Structure

```text
backend/  Express API for plan, daily action, and reflection generation
mobile/   Expo React Native app and Google Play metadata
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Required environment:

```bash
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=development
CLIENT_ORIGIN=*
API_SECRET=
DATABASE_URL=
REVENUECAT_API_KEY=
```

Production should set `API_SECRET` and a specific `CLIENT_ORIGIN` when a web client exists. `DATABASE_URL` is optional for local development; when set, the backend enables Postgres-backed daily AI generation quotas. `REVENUECAT_API_KEY` is reserved for server-side entitlement verification and is not required until purchases are wired.

## Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env.local
npx expo start
```

Required environment:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_API_SECRET=
```

For a physical Android device, `EXPO_PUBLIC_API_URL` should use your machine's LAN IP. For the Android emulator, the app can fall back to `10.0.2.2:3001`.

## Quality Checks

Run checks per service:

```bash
cd backend
npm run typecheck
npm test
```

```bash
cd mobile
npm run typecheck
npm test
```

GitHub Actions runs the same typecheck and test commands for both services.

## Highlights

- Generates structured goal plans with exactly seven steps
- Provides daily goal actions with fallback behavior if the API is unavailable
- Tracks completions, streaks, best streaks, and active goals
- Validates AI JSON with multiple extraction strategies before accepting it
- Meters discretionary AI generation with an opt-in Postgres quota store
- Schedules local daily reminders when notification permission is granted
- Supports Android Play Store metadata and Expo app configuration

## Known Limitations

- The static `API_SECRET` is a deterrent for closed testing, not strong production auth. A shipped APK can expose public environment values, so production hardening should move to per-user authentication such as OAuth/JWT with server-side authorization.
- The current quota identity is a per-install app ID sent as `x-user-id`; it is useful for closed-testing cost control, not a substitute for authenticated users or server-verified entitlements.
- User data is currently device-local through MMKV. There is no account system or cloud sync yet.
- Pro pricing and purchase UI are product placeholders until RevenueCat purchase and restore flows are connected. The backend currently treats all users as free tier.
- Postgres tables are bootstrapped at runtime for closed testing. Production should replace this with explicit migrations.
- AI output is validated and has fallbacks, but quality still depends on provider availability and model behavior.

## Production Hardening

- Replace the static bearer secret with per-user auth and server-side authorization.
- Wire RevenueCat entitlement verification and purchase restore flows before enabling paid plans.
- Move DB schema creation to migrations and add operational monitoring around AI/API failures.
- Add cloud sync or export/import recovery before relying on the app for multi-device use.
