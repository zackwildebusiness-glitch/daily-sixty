import { describe, expect, it } from 'vitest';
import { parseAIResponse } from './parseAI';
import { ActionSchema, PlanSchema } from '../schemas/aiSchemas';

const sevenStepPlan = Array.from({ length: 7 }, (_, index) => ({
  title: `Step ${index + 1}`,
  description: `Do focused work for step ${index + 1}.`,
  duration: '15 min/day',
}));

describe('parseAIResponse', () => {
  it('parses direct JSON responses', () => {
    const result = parseAIResponse(JSON.stringify(sevenStepPlan), PlanSchema, 'direct');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(7);
  });

  it('parses fenced JSON code blocks', () => {
    const result = parseAIResponse(
      `Here is the action:\n\n\`\`\`json\n${JSON.stringify({ title: 'Walk', why: 'Build momentum', minutes: '15' })}\n\`\`\``,
      ActionSchema,
      'fenced',
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.minutes).toBe(15);
  });

  it('skips invalid prose-prefixed arrays and returns the first schema-valid array', () => {
    const raw = `Use examples [1, 2] before the real plan: ${JSON.stringify(sevenStepPlan)}`;

    const result = parseAIResponse(raw, PlanSchema, 'prose-array');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data[0].title).toBe('Step 1');
  });

  it('extracts balanced object blocks from prose', () => {
    const raw = `The daily action is ${JSON.stringify({ title: 'Read', why: 'Build consistency', minutes: 20 })}.`;

    const result = parseAIResponse(raw, ActionSchema, 'object');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.title).toBe('Read');
  });

  it('returns a typed failure when no strategy can extract valid JSON', () => {
    const result = parseAIResponse('No structured data here.', ActionSchema, 'invalid');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Could not extract JSON');
  });
});
