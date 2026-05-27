# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daily Sixty is a goal-achievement app: users set a goal, receive an AI-generated 7-step plan, and complete one 15–20 min daily action. The repo has two independently deployed services.

## Repository Structure

```
/backend   — Node/Express/TypeScript API (Claude AI, Zod validation)
/mobile    — Expo SDK 56 React Native app (expo-router, MMKV, Zustand)
```

## Commands

### Backend
```bash
cd backend
npm run dev      # ts-node-dev with hot reload (development)
npm run build    # tsc → dist/
npm start        # run compiled dist/index.js (production)
```

### Mobile
```bash
cd mobile
npx expo start                        # Metro bundler
npx expo start --android              # Android device/emulator
npx expo run:android                  # native build (first time)
eas build --platform android --profile preview   # EAS APK build
```

## Environment Setup

**Backend** (`backend/.env`):
```
ANTHROPIC_API_KEY=sk-ant-...   # required
PORT=3001
NODE_ENV=development
CLIENT_ORIGIN=*
API_SECRET=                    # leave empty in dev; set in prod
```

**Mobile** (`mobile/.env.local`):
```
EXPO_PUBLIC_API_URL=http://<LAN_IP>:3001   # physical device needs LAN IP
EXPO_PUBLIC_API_SECRET=                    # match API_SECRET in backend
```
> Android emulator uses `10.0.2.2:3001` (auto-fallback). Physical device needs the actual LAN IP in `.env.local`.

## Architecture

### Backend (`backend/src/`)

- **`index.ts`** — Express app, CORS, helmet, rate limiting, `apiKeyGuard` middleware, route mounting
- **`config/constants.ts`** — Model name, token budgets per call type, temperature constants, rate-limit config
- **`config/env.ts`** — All `process.env` access isolated here; throws on missing required vars
- **`services/claude.ts`** — Anthropic SDK wrapper. All Claude calls go here. Uses prompt caching (`cache_control: ephemeral`) on the system prompt and assistant prefilling (`prefill: '['` or `'{'`) to force JSON-first responses
- **`parsers/parseAI.ts`** — 4-strategy JSON extractor (direct parse → fenced code block → balanced `[` blocks → balanced `{` blocks) + Zod validation. Never throws; returns `{ ok, data } | { ok, error, raw }`
- **`schemas/aiSchemas.ts`** — Zod schemas: `PlanSchema` (exactly 7 steps), `ActionSchema`, `ReflectionSchema`
- **`routes/plan.ts`** — `POST /api/plan/generate`
- **`routes/action.ts`** — `POST /api/action/today`, `POST /api/action/adjust`
- **`routes/reflection.ts`** — `POST /api/reflection/weekly`

### Mobile (`mobile/`)

- **`app/_layout.tsx`** — Root layout; wraps everything in `GestureHandlerRootView`, `BottomSheetModalProvider`, `ThemeProvider`
- **`app/(tabs)/`** — Tab screens: `index` (Today/Home), `goals`, `progress`, `profile`
- **`app/create/`** — Goal creation flow: `category → input → q1 (level) → q2 (successType) → generating → preview`
- **`app/goal/[id].tsx`** — Goal detail view
- **`app/timer.tsx`** — Fullscreen modal countdown timer
- **`store/index.ts`** — Zustand store with MMKV persistence. Single source of truth for all app state
- **`store/types.ts`** — All TypeScript interfaces (`Goal`, `User`, `Step`, `TodayAction`, `Completion`, etc.)
- **`lib/theme.ts`** — Static theme object resolved once at module load from `Appearance.getColorScheme()`. Dynamic mid-session OS theme switching is not supported
- **`lib/themes.ts`** — Palette definitions: `violet` (free), `crimson`/`ocean`/`forest`/`solar` (Pro)
- **`lib/ThemeContext.tsx`** — `ThemeProvider` + `useTheme()` hook; merges active palette accent colors over the base theme. Components must call `useTheme()` instead of importing `theme` directly for any accent color (`purple*`) to respect the user's chosen theme
- **`lib/api.ts`** — Typed fetch wrapper with 30s AbortController timeout
- **`lib/utils.ts`** — `computeStreak()`, `getWeekHistory()`, `getToday()`, `buildFallbackPlan()`
- **`config/api.ts`** — `API_BASE_URL` and typed `API_PATHS` constants

### Key Invariants

**Streaks must always be computed live** — never read `goal.streak` from the store for display. Always call `computeStreak(goal.completions)`. The stored `goal.streak` is only updated on completion and goes stale when a streak breaks.

**Plan must have exactly 7 steps** — enforced by `PlanSchema` on the backend and assumed throughout the UI (step progress, step advancement logic).

**Step advancement** — every 7 completions advances `currentStep` by 1; 49 completions = goal complete. When a step advances, `todayAction` is cleared so a fresh action is fetched on next open.

**Theme accent colors** — All `theme.purple*` references in components must come from `useTheme()`, not the static `import { theme }`. The static import is only safe for surface/semantic/category colors that don't change per-theme.

**Fallback plan** — if the Claude API call fails twice, `buildFallbackPlan()` returns a static per-category template. This is silent to the user.

## Expo / React Native Notes

- Target device: Samsung Tab S9 (Android), portrait
- `newArchEnabled: true` — New Architecture (JSI/Nitro Modules) is active
- `react-native-mmkv v4.3.1` — synchronous JSI storage; do NOT replace with AsyncStorage in the Zustand persist layer
- `expo-router` file-based routing; `(tabs)` group uses `CustomTabBar` component
- `@gorhom/bottom-sheet` for all sheets — always pass `ref` as `React.RefObject<BottomSheet | null>`
- Before writing Expo-specific code, read the versioned docs at `https://docs.expo.dev/versions/v56.0.0/`

## Code Style

- **No comments by default.** Only add one when the WHY is non-obvious. No multi-line comment blocks or JSDoc.
- `StyleSheet.create` is for layout/structural styles. Accent colors from `useTheme()` must be inline styles (they can't be baked into module-level StyleSheet).
- All user text passed to the backend is sanitized (strip control chars, slice to max length) at the route layer before embedding in prompts.
