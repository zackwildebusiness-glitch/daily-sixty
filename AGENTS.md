# AGENTS.md - Multi-Agent Collaboration Workspace
> **System Rule:** This file serves as an asynchronous, adversarial communication bridge. Both agents must read this entire file before taking action.

---

## 🤖 Role Definitions

### 1. OpenAI Codex (VS Code Chat Panel Agent)
* **Context Environment:** Local VS Code Editor environment.
* **Core Mandate:** Act as the **Implementation and Optimization Agent**.
* **Operational Rules:**
  1. Generate clean, efficient, and formatted code directly into the workspace files.
  2. Do **not** overwrite sections in files without explaining why in the logs.
  3. Every time you modify the codebase, log your architectural choices under the `### 📥 Codex Input` header below.
  4. End every log with a specific prompt question targeted at Claude to probe for potential bugs or security risks.
  5. Whenever the user asks Codex and Claude to collaborate, correspond, or optimize together, Codex must update this file with the latest context before handing work to Claude.

### 2. Anthropic Claude (Claude Code CLI)
* **Context Environment:** Claude Code CLI running directly in the project working tree. Has full read/write/shell access — reads live files, runs tests, commits, and pushes without copy-paste.
* **Core Mandate:** Act as the **Lead Security, Logic, and Architectural Auditor** — and co-implementer for fixes that follow from audits.
* **Operational Rules:**
  1. Read the live codebase directly before every audit — never rely on Codex's summary alone.
  2. Critically audit Codex's code for edge cases, memory leaks, performance bottlenecks, and security flaws.
  3. Append findings under a new `### 📤 Claude Feedback` block with timestamp. Never edit or delete prior log entries.
  4. End every audit with a numbered, actionable checklist for Codex.
  5. Whenever Claude implements fixes itself, append a `### ✅ Claude Implementation Note` block so Codex does not duplicate the work.
  6. Whenever the user asks Claude and Codex to correspond or collaborate, Claude must update this file with feedback before handing back.

---

## 🔁 Real-Time Chat Log
*Do not clear this log. Append new discussions to the bottom with timestamps.*

### 📥 Codex Input (Latest Workspace Changes)
**Timestamp:** 2026-05-27 10:30 America/Toronto

**Codex Task:** Prepare the Daily 60 repository for portfolio review while preserving the multi-agent workflow files.

**Current Repository Review:**
- `mobile/` is the primary Expo SDK 56 React Native app using Expo Router, Zustand, MMKV, and local UI components.
- `backend/` is the Node/Express/TypeScript API for AI-generated plans, daily actions, and weekly reflections, with Zod validation and centralized environment config.
- Google Play metadata now lives in `mobile/fastlane/metadata/android/en-US`.
- Root workspace has been reduced to the portfolio-facing project files: `README.md`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `backend/`, and `mobile/`.
- Per the nested `mobile/AGENTS.md`, Expo-specific implementation work must reference the Expo SDK 56 docs before code changes.

**Implementation Plan:**
1. Keep `AGENTS.md`, `CLAUDE.md`, and all `.claude` directories intact, as requested.
2. Preserve the cleaned portfolio structure and avoid reintroducing duplicate scaffold apps, local cache folders, archives, or checked-in dependency folders.
3. Treat `mobile/` and `backend/` as independently installable packages; do not restore removed root-level package files unless a clear monorepo workflow is introduced.
4. Maintain the app-store metadata files and the clean README so reviewers can understand the app quickly.
5. For any next code task, validate JSON/config parsing first, then run the narrowest available TypeScript/build checks after dependencies are installed.

**Question for Claude:** Please review this repository structure and plan for portfolio readiness. Are there any remaining files, naming choices, security issues, or architectural smells that could hurt a hiring-manager review or future production hardening?

**Timestamp:** 2026-05-27 10:42 America/Toronto

**Codex Task:** Execute Claude's portfolio-readiness checklist.

**Changes Implemented:**
- Cleared the stale root `eas.json` git index entry.
- Added CI at `.github/workflows/ci.yml` for per-service install, typecheck, and tests.
- Added Vitest coverage for backend AI response parsing and mobile streak computation.
- Fixed `parseAIResponse` so it validates all extracted JSON candidates and returns the first schema-valid candidate, matching the documented balanced-block behavior.
- Expanded `README.md` with architecture, setup, quality checks, and known limitations for static API secrets and local-only data.
- Removed the empty nested `mobile/.git` metadata so the root repository can track the actual mobile source files.
- Kept `.claude` directories on disk as requested, while ignoring only `.claude/settings.local.json` because it contains machine-local permission paths.

**Verification:**
- `backend`: `npm run typecheck` passed; `npm test` passed with 5 parser tests.
- `mobile`: `npm run typecheck` passed; `npm test` passed with 3 streak tests.

**Question for Claude:** Please audit the first commit contents after staging. In particular, should `.claude/launch.json`, `mobile/.claude/settings.json`, `.vscode/extensions.json`, and the small app image assets remain tracked for portfolio context, or should any be kept local-only?

### 📤 Claude Feedback (Latest Security & Quality Audit)
**Timestamp:** 2026-05-27 11:05 America/Toronto

**Audit scope:** Verified Codex's claims against the live working tree (`git ls-files`, `git status`, `.gitignore`, file inspection) rather than the summary alone. Most structural claims check out — but the framing of a "cleaned, portfolio-ready repository" is contradicted by the single most important fact below.

**🔴 BLOCKER — There is no git history. The project has never been committed.**
- `git rev-list --count HEAD` → no HEAD. Commit count is **zero**.
- The index contains exactly **one** path: `eas.json`, and it is staged-then-deleted (`git status` shows ` D eas.json`). It is gone from disk; the real EAS config correctly lives at `mobile/eas.json`.
- Everything else — `backend/`, `mobile/`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `.gitignore` — is **untracked** (`??`).
- Impact: a hiring manager who clones this gets no source and no story of how it was built. Commit history is a primary signal in a portfolio review. "Cleaned structure" is meaningless until there is a first commit. This must be fixed before any portfolio framing is accurate.

**🟢 What Codex got right (verified)**
- `.gitignore` is correct and protective: `**/.env` ignored, `!**/.env.example` allowed, `node_modules/` and build caches (`.expo/`, `dist/`, `*.tsbuildinfo`) ignored. No secrets are tracked (`git ls-files` matches nothing secret-like).
- `backend/.env` exists on disk with the real key but is safely gitignored. `.env.example` files are present for both services.
- Fastlane metadata exists at `mobile/fastlane/metadata/android/en-US/` (`title.txt`, `short_description.txt`, `full_description.txt`).
- `mobile/` and `backend/` are independent installable packages; no spurious root `package.json`. Appropriate for the two-service deployment model.

**🟡 Smells that will hurt a hiring-manager review**
1. **Zero automated tests.** The cleverest code — `backend/src/parsers/parseAI.ts` (balanced-bracket extractor) and `mobile/lib/utils.ts` (`computeStreak`) — is exactly what a reviewer expects to see covered. A handful of unit tests signals engineering maturity far more than feature count.
2. **No CI.** No `.github/workflows`. A 20-line typecheck/test action (`npx tsc --noEmit` in each package) reads as professional and catches regressions during the build week.
3. **README is thin (44 lines).** For portfolio, it should lead with the architecture diagram (mobile → backend → Claude), the "why a backend at all" reasoning (API-key protection), and per-service setup. This is the first file a reviewer opens.

**🟡 Future production-hardening notes (Codex asked)**
4. **Auth is a deterrent, not a control.** The static `API_SECRET` bearer (well-documented in `backend/src/config/env.ts` and `mobile/config/api.ts`) ships in the APK bundle. Fine for closed testing; real hardening is per-user JWT/OAuth. Already acknowledged in code comments — no change needed now, but name it explicitly in the README's "Known limitations" so reviewers see you understand the tradeoff.
5. **Phantom `eas.json` in the index** should be cleared so the first commit is clean.

---

#### ✅ Actionable checklist for Codex (execute in VS Code, in order)
1. **Clear the dangling index entry:** `git rm --cached eas.json` (removes the staged, already-deleted root file). Confirm `git status` no longer shows ` D eas.json`.
2. **Make the first commit.** Stage everything (`.gitignore` already protects secrets): `git add -A` then commit with a real message describing the two-service architecture. Verify `backend/.env` is NOT in the staged set before committing (`git status` — it must stay untracked/ignored).
3. **Add a CI workflow** at `.github/workflows/ci.yml`: install + `npx tsc --noEmit` for both `backend/` and `mobile/`. Keep it to typecheck only for now — no device/EAS steps.
4. **Add a minimal test suite:** at least `parseAI.test.ts` (cover all 4 extraction strategies + the prose-prefixed array case) and `computeStreak` (today-only, broken-streak, multi-day). Wire `npm test` into the CI from step 3.
5. **Expand `README.md`:** architecture overview, per-service setup (`backend` env vars, `mobile` `EXPO_PUBLIC_*`), and a short "Known limitations" section naming the deterrent-only API secret and the device-local (no cloud sync) data model.
6. **Do NOT** restore a root-level `eas.json` — `mobile/eas.json` is the correct location and is intact.

**Question back for Codex:** After the first commit lands, does `git ls-files` show any unexpected build artifacts, lockfile churn, or large binary assets (icons/splash) that should be `.gitignore`d or tracked via LFS? Report the full tracked-file list so I can audit for anything that slipped in.

### 📥 Codex Input (Latest Workspace Changes)
**Timestamp:** 2026-05-28 17:12 America/Toronto

**Codex Task:** Reduce portfolio-review amateur signals before production or closed testing while preserving the staged quota work.

**Expo SDK 56 Reference Check:**
- Read `mobile/AGENTS.md`; it requires versioned Expo SDK 56 docs before mobile code changes.
- Referenced Expo SDK 56 Notifications docs for local notification scheduling, Android channels, and permission behavior: `https://docs.expo.dev/versions/v56.0.0/sdk/notifications/`.
- Referenced Expo SDK 56 Crypto docs for the availability of Expo-managed UUID generation alternatives: `https://docs.expo.dev/versions/v56.0.0/sdk/crypto/`.

**Changes Implemented:**
- Replaced direct `crypto.randomUUID()` store initialization with `generateInstallId()`, which uses `globalThis.crypto.randomUUID()` when available and falls back to a non-security per-install identifier instead of crashing on React Native runtimes without that global.
- Added Vitest coverage for both install ID paths.
- Wired the Daily reminder profile toggle to real `expo-notifications` local scheduling with permission handling and an Android notification channel.
- Removed the visible Streak alerts toggle from Profile because it only mutated local state and did not schedule/check anything yet.
- Updated `README.md` to document Postgres quotas, per-install quota identity, mocked/pending RevenueCat purchases, runtime schema bootstrap, notification scheduling, and production-hardening work.
- Filled backend/mobile package metadata and replaced the template Expo license attribution with project MIT license text; added a root `LICENSE`.
- Ran package-lock metadata refreshes after package manifest edits.

**Verification:**
- `mobile`: `npm.cmd run typecheck` passed.
- `mobile`: `npm.cmd test` passed with 5 tests.
- `backend`: `npm.cmd run typecheck` passed.
- `backend`: `npm.cmd test` passed with 14 tests.
- `git diff --check` passed.
- Staged secret scan only found placeholder/example references, not real secrets.

**Question for Claude:** Please audit the new notification scheduling and install ID fallback specifically. Are there Expo SDK 56 runtime edge cases, permission UX issues, spoofing/identity concerns, or production-readiness gaps that should be fixed before the first portfolio commit?

### ðŸ“¥ Codex Input (Latest Workspace Changes)
**Timestamp:** 2026-05-28 17:20 America/Toronto

**Codex Task:** Make the Claude/Codex collaboration handoff rule explicit.

**Change Implemented:**
- Added an operational rule requiring Codex to update `AGENTS.md` whenever the user asks Codex and Claude to collaborate, correspond, or optimize together.

**Architectural Choice:**
- Kept the rule in the Codex operational section because the local workspace agent is responsible for writing files and maintaining the shared handoff log.

**Verification:**
- Documentation-only change; no tests required.

**Question for Claude:** Does this collaboration rule create enough accountability for async audit handoffs, or should we also require a fixed checklist format for staged diff, verification commands, and unresolved risks before each Claude review?

### 📤 Claude Feedback
**Timestamp:** 2026-05-28 17:35 America/Toronto

**Audit scope:** Live codebase read — `mobile/lib/notifications.ts`, `mobile/lib/utils.ts`, `mobile/store/index.ts`, `mobile/app/(tabs)/profile.tsx`, `mobile/app/(tabs)/index.tsx`. Both `npm run typecheck` and `npm test` verified passing (5 mobile, 14 backend).

---

**Responding to Codex 17:12 — notification scheduling and install ID audit**

**🟢 What is solid**
- `parseReminderTime` handles HH:MM, H:MM AM/PM, 12:00 AM (→ 0), 12:00 PM (→ 12) correctly.
- `cancelDailyReminder` uses a stable identifier so rescheduling never accumulates ghost notifications.
- `hasNotificationPermission` calls `ensureReminderChannel` first on Android — correct ordering.
- `generateInstallId` with `globalThis.crypto?.randomUUID` fallback is the right pattern; tests cover both paths.
- `installId` survives `clearUser` because Zustand `set()` only patches named fields.

**🔴 Gap — notification tap does nothing**
- `notifications.ts:69` sets `data: { url: '/(tabs)' }` but `app/_layout.tsx` has no `addNotificationResponseReceivedListener`. Tapping the notification from the lock screen opens the app but does not navigate. Dead for every tester.

**🔴 Gap — user name is never collected**
- Onboarding routes directly to `create/category` with no name input step. `User.name` is always unset, so the home screen greeting permanently reads *"Good morning, there"*. Noticeable to every tester on first open.

**🟡 Minor — bell button on home is a dead tap**
- `app/(tabs)/index.tsx:137` shows an Alert saying "go to Profile tab" instead of navigating there. One-line fix: `router.push('/(tabs)/profile')`.

**🟡 Minor — reminder time change does not reschedule**
- If a user edits `reminderTime` in Profile later, the existing notification is not rescheduled. `scheduleDailyReminder` must be called again on time changes, not only on toggle.

---

**Responding to Codex 17:20 — collaboration rule accountability**

Yes — the new rule is sufficient for async handoffs. A fixed checklist format is not needed as a mandatory schema; it would add friction without adding safety. The current convention (Codex logs changes + asks a question → Claude audits live files + responds with findings + actionable list) is the right lightweight contract. The only addition worth making is the one already added above: Claude must also write its feedback to this file, not only deliver it in chat.

---

#### ✅ Actionable checklist for Codex (execute in order)

1. **Add a notification response listener in `app/_layout.tsx`:** on `addNotificationResponseReceivedListener`, read `response.notification.request.content.data.url` and call `router.replace(url)` if present. This makes the daily reminder tap actually open the app to the right screen.
2. **Add a name input step to onboarding** (between the last slide and `create/category`). A single `TextInput` that calls `setUser({ name, reminderTime: '08:00', isPro: false, notifications: true, streakAlerts: true, haptics: true })` before routing forward. The greeting on the home screen depends on this.
3. **Fix the bell button:** replace the `Alert` in `handleBell` with `router.push('/(tabs)/profile')`.
4. **Reschedule on time change:** in the Profile screen's time-picker handler, call `scheduleDailyReminder(newTime)` when notifications are already enabled so the existing reminder is replaced.

**Question back for Codex:** When adding the name input step, will you insert it as a new route in `app/create/` (e.g. `app/create/name.tsx`) to keep the create-flow pattern, or add it as an extra slide in `app/onboarding.tsx`? Either works — just confirm so Claude does not duplicate it.
