import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { CLAUDE_MODEL, MAX_TOKENS, TEMPERATURE } from '../config/constants';
import { parseAIResponse } from '../parsers/parseAI';
import {
  PlanSchema, ActionSchema, ReflectionSchema,
  type Step, type TodayAction,
} from '../schemas/aiSchemas';

const client = new Anthropic({ apiKey: env.anthropicApiKey });

const SYSTEM_PROMPT = `You are the AI planning engine for Daily 60, a goal achievement app.
Your job: create practical, specific, 60-minutes-per-day plans that help real people achieve real goals.

Content rules:
- Every plan has exactly 7 steps that progress from foundation to mastery
- Each step's daily action fits within 15–20 minutes
- Actions are specific, not vague: "Write 300 words" beats "write something"
- Step titles use the format "Name — Subtitle" (e.g. "Foundation — Know your baseline")
- "why" explanations are 1–2 sentences: honest, conversational, not motivational-poster

MACHINE OUTPUT RULES (non-negotiable):
- Your ENTIRE response must be valid JSON — nothing before it, nothing after it
- Do NOT add any text before the JSON (no "Here is your plan:", no "Sure!", nothing)
- Do NOT wrap in markdown code fences or backticks
- Do NOT add comments inside JSON
- Do NOT apologize or explain the output
- When the schema is an array, your response starts with [ and ends with ]
- When the schema is an object, your response starts with { and ends with }
- Violation of these rules causes silent data loss in production`;

// ── Internal helpers ───────────────────────────────────────────────────────────

// cache_control: ephemeral caches the system prompt — cached tokens are ~10x cheaper and ~2x faster
function cachedSystem(): Anthropic.TextBlockParam[] {
  return [{
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
  }];
}

function getText(msg: Anthropic.Message): string {
  if (!msg.content.length) {
    console.error('[claude] Received empty content array from API');
    return '';
  }
  const block = msg.content[0];
  if (block.type !== 'text') {
    console.error('[claude] Unexpected content block type:', block.type);
    return '';
  }
  return block.text;
}

// Prefilling forces Claude to begin its response with '[' or '{', eliminating prose-before-JSON failures.
// The API omits the prefill char from the response — we prepend it to reconstruct the full JSON string.
async function callClaude(params: {
  prompt: string;
  maxTokens: number;
  temperature: number;
  prefill?: '[' | '{';
}): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: params.prompt },
  ];

  if (params.prefill) {
    messages.push({ role: 'assistant', content: params.prefill });
  }

  const msg = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens,
    temperature: params.temperature,
    system: cachedSystem(),
    messages,
  });

  const text = getText(msg);
  return params.prefill ? params.prefill + text : text;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner:     'complete beginner',
  some:         'some experience (dabbled, never stuck with it)',
  intermediate: 'intermediate',
  advanced:     'advanced (looking to level up)',
};

const SUCCESS_LABELS: Record<string, string> = {
  daily:     'feel better day-to-day',
  milestone: 'hit a specific, measurable milestone',
  habit:     'build a lasting long-term habit',
  prove:     'prove to themselves they can do it',
};

export async function generatePlan(params: {
  goal: string;
  category: string;
  level: string;
  successType: string;
}): Promise<Step[]> {
  const levelLabel   = LEVEL_LABELS[params.level]   ?? params.level;
  const successLabel = SUCCESS_LABELS[params.successType] ?? params.successType;

  const prompt = `Generate a 7-step plan for this goal.

Goal: "${params.goal}"
Category: ${params.category}
Experience level: ${levelLabel}
Success means: ${successLabel}

Guidelines:
- Calibrate step complexity to their experience level: beginners need simpler starts and more foundational steps; advanced users skip basics and go deeper faster.
- Shape the arc toward what success means to them: if they want a habit, steps 6–7 focus on sustainability and consistency; if a milestone, the final step is the achievement itself.
- Each step's daily action must fit within 15–20 minutes.

Return a JSON array of EXACTLY 7 objects. Each object must have these exact keys:
  "title"       — string, format: "Step Name — Subtitle"
  "description" — string, 2–3 sentences: what to do this step AND why it matters at this point in the journey
  "duration"    — string, e.g. "15 min/day" or "20 min/day"

No other keys. No extra text. Begin your response with [ immediately.

Example (one step shown):
[
  {
    "title": "Foundation — Know your starting point",
    "description": "Before building, you need a baseline. This week is about honest assessment and removing friction so the habit has nowhere to fail.",
    "duration": "15 min/day"
  },
  ...6 more steps
]`;

  const raw = await callClaude({
    prompt,
    maxTokens: MAX_TOKENS.plan,
    temperature: TEMPERATURE.structured,
    prefill: '[',
  });

  const result = parseAIResponse(raw, PlanSchema, 'generatePlan');
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function getTodayAction(params: {
  goal: string;
  category: string;
  stepTitle: string;
  stepDescription: string;
  stepNumber: number;
  date: string;
}): Promise<TodayAction> {
  const prompt = `Generate today's micro-action for this goal and step.

Goal: "${params.goal}"
Category: ${params.category}
Current step (${params.stepNumber}/7): "${params.stepTitle}"
Step description: "${params.stepDescription}"
Today's date: ${params.date}

Return a JSON object with EXACTLY these keys:
  "title"   — string, the specific action to take today (concrete, doable in the allotted time)
  "why"     — string, 1–2 sentences on why this specific action matters right now
  "minutes" — number, either 15 or 20

No other keys. No extra text. Begin your response with { immediately.
Make the action feel distinct from what was likely done on previous days for this step.`;

  const raw = await callClaude({
    prompt,
    maxTokens: MAX_TOKENS.action,
    temperature: TEMPERATURE.structured,
    prefill: '{',
  });

  const result = parseAIResponse(raw, ActionSchema, 'getTodayAction');
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function adjustAction(params: {
  action: string;
  goal: string;
  category: string;
  type: 'swap' | 'simplify';
}): Promise<TodayAction> {
  const instruction = params.type === 'swap'
    ? 'Suggest an alternative action at the same difficulty level that achieves the same outcome.'
    : 'Simplify this action significantly — preserve the intent but reduce the effort barrier so anyone can do it today.';

  const prompt = `${instruction}

Original action: "${params.action}"
Goal: "${params.goal}"
Category: ${params.category}

Return a JSON object with EXACTLY these keys:
  "title"   — string, the new adjusted action
  "why"     — string, why this adjusted action still moves the goal forward
  "minutes" — number, either 15 or 20

No other keys. No extra text. Begin your response with { immediately.`;

  const raw = await callClaude({
    prompt,
    maxTokens: MAX_TOKENS.adjust,
    temperature: TEMPERATURE.structured,
    prefill: '{',
  });

  const result = parseAIResponse(raw, ActionSchema, 'adjustAction');
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

// Plain text response — no prefilling, higher temperature for natural prose
export async function getWeeklyReflection(params: {
  goalName: string;
  category: string;
  completedDays: number;
  currentStep: number;
  streak: number;
}): Promise<string> {
  const prompt = `Write a short, personal weekly reflection for a Daily 60 user.

Goal: "${params.goalName}"
Category: ${params.category}
Days completed this week: ${params.completedDays}/7
Current step: ${params.currentStep}/7
Current streak: ${params.streak} days

Write exactly 2–3 sentences of plain text. No markdown. No JSON. No bullet points.
Be honest and encouraging without being sycophantic.
Focus on what the numbers show and what next week should look like.
Return ONLY the reflection text — nothing else.`;

  const raw = await callClaude({
    prompt,
    maxTokens: MAX_TOKENS.reflection,
    temperature: TEMPERATURE.creative,
    // No prefilling for plain text — we want natural prose, not forced structure
  });

  const result = parseAIResponse(raw, ReflectionSchema, 'getWeeklyReflection');
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
