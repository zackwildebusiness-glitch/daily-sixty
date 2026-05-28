/**
 * Static app constants.
 *
 * Model names, token budgets, rate-limit windows — values that rarely change
 * but need to be changed consistently across multiple call sites.
 */

/** Claude model used for all AI calls. Bump here to upgrade everywhere. */
export const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

/** Token budgets per call type (generous but bounded). */
export const MAX_TOKENS = {
  plan:       2048,  // 7-step plan JSON array — bumped from 1500 to avoid truncation on step 7
  action:      300,  // single action object
  adjust:      250,  // adjusted action object
  reflection:  200,  // plain-text paragraph
} as const;

/**
 * Temperature controls how "random" Claude's output is (0.0 = deterministic,
 * 1.0 = maximum variation, default).
 *
 * For structured JSON output (plan, action) lower temperature means the model
 * is more likely to follow format instructions precisely. For creative prose
 * (reflection) a higher value produces more natural, varied text.
 */
export const TEMPERATURE = {
  structured: 0.2,  // plan generation, action generation — format compliance matters
  creative:   0.7,  // weekly reflection — natural prose, some variation is good
} as const;

/** API rate limiting. */
export const RATE_LIMIT = {
  windowMs: 60_000,   // 1 minute
  maxProd:      20,
  maxDev:      100,
} as const;

/**
 * Daily AI-generation quota, per user, by entitlement tier.
 *
 * Counts only DISCRETIONARY generations (plan creation, action swap/simplify) —
 * the once-per-day core action is part of the free loop and is not metered here.
 * Resets daily (UTC). Premium is high enough to feel "unlimited" for real use
 * while still capping runaway cost from a compromised credential.
 */
export const AI_QUOTA = {
  freeDailyGenerations:    3,
  premiumDailyGenerations: 50,
} as const;
