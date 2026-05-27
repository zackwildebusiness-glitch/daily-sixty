/**
 * AI response schemas — the single source of truth for what we expect from Claude.
 *
 * Using Zod for three reasons:
 *
 * 1. The TypeScript type IS the schema. `z.infer<typeof StepSchema>` produces
 *    the exact same type as a hand-written interface, but they can never drift
 *    apart because they're derived from the same definition.
 *
 * 2. `schema.safeParse(data)` never throws — it returns a typed discriminated
 *    union: `{ success: true, data: T } | { success: false, error: ZodError }`.
 *    This makes error handling explicit rather than a surprise exception.
 *
 * 3. Zod handles common AI response quirks automatically:
 *    - `.trim()` strips whitespace from Claude's string outputs
 *    - `z.coerce.number()` accepts both `15` and `"15"` for numeric fields
 *    - `.min()` / `.max()` enforce sane bounds without extra code
 */
import { z } from 'zod';

// ── Step (one of 7 in a generated plan) ──────────────────────────────────────

export const StepSchema = z.object({
  title:       z.string().trim().min(1, 'Step title is required'),
  description: z.string().trim().min(1, 'Step description is required'),
  duration:    z.string().trim().min(1, 'Step duration is required'),
});

/**
 * A plan must have exactly 7 steps. This is a product invariant — the entire
 * UI is built around a 7-step journey. Fewer or more breaks the app.
 */
export const PlanSchema = z.array(StepSchema).length(7, {
  message: 'AI plan must contain exactly 7 steps',
});

// ── TodayAction (a single daily micro-action) ─────────────────────────────────

export const ActionSchema = z.object({
  title: z.string().trim().min(1, 'Action title is required'),
  why:   z.string().trim().min(1, 'Action "why" is required'),

  /**
   * Claude occasionally returns `"minutes": "15"` (string) instead of `15`
   * (number) despite explicit schema instructions. `z.coerce.number()` calls
   * Number() on whatever is passed, cleanly handling both cases.
   *
   * Bounds: 1–120 minutes. Prevents nonsensical values like 0 or 999.
   */
  minutes: z.coerce.number().int().min(1).max(120),
});

// ── Weekly Reflection (plain text, not JSON) ──────────────────────────────────

/**
 * A plain-text paragraph. Minimal validation: we just want something
 * substantive, not an empty string or a single word.
 */
export const ReflectionSchema = z.string().trim().min(20, 'Reflection too short');

// ── Exported TypeScript types (derived from schemas — never written by hand) ──

export type Step         = z.infer<typeof StepSchema>;
export type Plan         = z.infer<typeof PlanSchema>;
export type TodayAction  = z.infer<typeof ActionSchema>;
export type Reflection   = z.infer<typeof ReflectionSchema>;
