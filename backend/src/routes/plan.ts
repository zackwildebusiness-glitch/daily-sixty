import { Router, Request, Response } from 'express';
import { generatePlan } from '../services/claude';
import { aiQuota } from '../middleware/quota';

const router = Router();

const VALID_CATEGORIES = new Set(['health','career','finance','learning','relationships','creativity','mindset','custom']);
const VALID_LEVELS     = new Set(['beginner','some','intermediate','advanced']);
const VALID_SUCCESS    = new Set(['daily','milestone','habit','prove']);

const sanitize = (s: string, max: number) =>
  String(s).trim().slice(0, max).replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ').trim();

router.post('/generate', aiQuota, async (req: Request, res: Response) => {
  const { goal, category, level, successType } = req.body;

  if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
    res.status(400).json({ error: 'goal is required (min 3 chars)' });
    return;
  }
  if (!category || typeof category !== 'string' || !VALID_CATEGORIES.has(category)) {
    res.status(400).json({ error: 'category must be one of: ' + [...VALID_CATEGORIES].join(', ') });
    return;
  }
  if (level != null && !VALID_LEVELS.has(level)) {
    res.status(400).json({ error: 'level must be one of: ' + [...VALID_LEVELS].join(', ') });
    return;
  }
  if (successType != null && !VALID_SUCCESS.has(successType)) {
    res.status(400).json({ error: 'successType must be one of: ' + [...VALID_SUCCESS].join(', ') });
    return;
  }

  try {
    const steps = await generatePlan({
      goal:        sanitize(goal, 200),
      category,
      level:       level ?? 'beginner',
      successType: successType ?? 'daily',
    });
    res.json({ steps });
  } catch (err) {
    console.error('[plan/generate]', err);
    res.status(500).json({ error: 'Failed to generate plan. Please try again.' });
  }
});

export default router;
