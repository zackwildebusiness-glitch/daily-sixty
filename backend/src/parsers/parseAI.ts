/**
 * AI response parsing boundary.
 *
 * Single responsibility: take raw Claude output (a string) and a Zod schema,
 * and return a validated, typed result — or a clear error.
 *
 * Nothing in this file talks to Claude. Nothing in claude.ts does parsing.
 * That separation means when something goes wrong in production, you know
 * immediately which layer failed.
 */
import { z } from 'zod';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Discriminated union result — the parser never throws, callers decide. */
type ParseResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string; raw: string };

// ── Balanced-bracket JSON extraction ─────────────────────────────────────────

/**
 * WHY NOT REGEX?
 *
 * The greedy pattern /\[[\s\S]*\]/ matches from the FIRST '[' to the LAST ']'.
 * If Claude writes:
 *
 *   "Consider steps [1, 2] as building blocks: [{"title": "Foundation"...}]"
 *
 * The regex captures the entire span from '[1, 2]' through to the final ']',
 * producing a string that is not valid JSON. The parse fails, the error is
 * confusing, and the actual plan is sitting right there in the string.
 *
 * A balanced-bracket scanner walks the string character by character,
 * tracking depth and string-literal state. It returns the first syntactically
 * COMPLETE block — properly closed at depth 0. It's O(n) and handles all
 * nesting correctly, including strings containing brackets.
 *
 * Example trace for '...steps [1,2]: [{"key":"val"}]':
 *   Finds '[' at index 9  → depth 1
 *   Finds ']' at index 13 → depth 0 → returns "[1,2]"
 *   JSON.parse("[1,2]") succeeds but Zod rejects it (not Step[])
 *   Scanner continues, finds '[' at index 16 → depth 1
 *   ... → returns '[{"key":"val"}]'
 *   JSON.parse succeeds AND Zod validates → done.
 */
function findAllBalancedBlocks(text: string, open: '{' | '['): string[] {
  const close = open === '{' ? '}' : ']';
  const results: string[] = [];
  let i = 0;

  while (i < text.length) {
    const start = text.indexOf(open, i);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let found = false;

    for (let j = start; j < text.length; j++) {
      const c = text[j];

      // Track escape sequences inside strings to avoid misreading \" as end-of-string
      if (escape) { escape = false; continue; }
      if (c === '\\' && inString) { escape = true; continue; }

      // Track string literals — brackets inside strings don't count
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (c === open)  { depth++; }
      else if (c === close) {
        depth--;
        if (depth === 0) {
          results.push(text.slice(start, j + 1));
          i = j + 1;
          found = true;
          break;
        }
      }
    }

    // Unbalanced bracket (truncated response) — stop scanning
    if (!found) break;
  }

  return results;
}

/**
 * Extracts JSON candidates from a Claude response using multiple strategies,
 * ordered from most specific to least. Each strategy is independently
 * try/caught so failure is silent until all are exhausted.
 *
 * Strategy 1 — Direct parse
 *   The happy path. When Claude follows the system prompt and returns clean JSON.
 *   With assistant prefilling enabled, this succeeds ~99% of the time.
 *
 * Strategy 2 — Fenced code block
 *   Handles ```json\n...\n``` wrapping. Claude adds this despite instructions
 *   not to, especially on conversational rephrasing or follow-up generations.
 *
 * Strategy 3 — All balanced [...] blocks, tried in order
 *   Handles prose-prefixed responses. Tries each complete array block found
 *   in the text so schema validation can choose the first valid candidate.
 *
 * Strategy 4 — All balanced {...} blocks, tried in order
 *   Same for object responses.
 *
 * Returns an empty array if all strategies fail (caller decides how to handle).
 */
function extractJSONCandidates(text: string): unknown[] {
  const s = text.trim();
  if (!s) return [];
  const candidates: unknown[] = [];

  // Strategy 1: entire response is valid JSON
  try { candidates.push(JSON.parse(s)); } catch { /* try next */ }

  // Strategy 2: fenced code block  ```json ... ``` or ``` ... ```
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced?.[1]) {
    try { candidates.push(JSON.parse(fenced[1])); } catch { /* try next */ }
  }

  // Strategy 3: all balanced [...] blocks
  for (const block of findAllBalancedBlocks(s, '[')) {
    try { candidates.push(JSON.parse(block)); } catch { /* try next */ }
  }

  // Strategy 4: all balanced {...} blocks
  for (const block of findAllBalancedBlocks(s, '{')) {
    try { candidates.push(JSON.parse(block)); } catch { /* try next */ }
  }

  return candidates;
}

// ── Public parsing function ───────────────────────────────────────────────────

/**
 * Parses and validates a raw Claude response string against a Zod schema.
 *
 * @param raw     - The raw text from Claude's response
 * @param schema  - Zod schema to validate against
 * @param context - Label used in error logs (e.g. "generatePlan")
 *
 * Returns `{ ok: true, data }` or `{ ok: false, error, raw }`.
 * Never throws — the caller decides what to do on failure.
 *
 * WHY return a result type instead of throwing?
 * Parsing AI responses is a *predictable* failure mode, not an exceptional
 * one. Throwing forces callers to remember to try/catch a specific failure
 * path. Returning a typed result makes the failure path visible and explicit.
 * The route's try/catch remains for *unexpected* failures (API timeouts,
 * network errors, etc.) — not for the known case of "model returned wrong format".
 */
export function parseAIResponse<T>(
  raw: string,
  schema: z.ZodSchema<T>,
  context: string,
): ParseResult<T> {
  // Empty raw response — log this specifically, it usually means API trouble
  if (!raw.trim()) {
    console.error(`[${context}] Empty response from AI`);
    return { ok: false, error: 'Empty response from AI', raw };
  }

  // Extraction
  const candidates = extractJSONCandidates(raw);
  if (candidates.length === 0) {
    console.error(`[${context}] JSON extraction failed. Raw (500 chars): ${raw.slice(0, 500)}`);
    return { ok: false, error: 'Could not extract JSON from AI response', raw };
  }

  // Schema validation
  let lastError: z.ZodError<T> | null = null;
  for (const candidate of candidates) {
    const result = schema.safeParse(candidate);
    if (result.success) {
      return { ok: true, data: result.data };
    }
    lastError = result.error;
  }

  // Log both the specific field errors AND the raw response so you can
  // diagnose exactly what the model returned vs what was expected.
  console.error(`[${context}] Schema validation failed:`, lastError?.flatten());
  console.error(`[${context}] Raw AI response (500 chars): ${raw.slice(0, 500)}`);
  return {
    ok: false,
    error: `AI response failed schema validation: ${lastError?.message ?? 'unknown schema error'}`,
    raw,
  };
}
