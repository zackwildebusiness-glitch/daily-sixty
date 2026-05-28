import { Router, Request, Response } from 'express';
import { getTodayAction, adjustAction } from '../services/claude';
import { aiQuota } from '../middleware/quota';

const router = Router();

const sanitize = (s: string, max: number) =>
  String(s).trim().slice(0, max).replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ').trim();

router.post('/today', async (req: Request, res: Response) => {
  const { goal, category, stepTitle, stepDescription, stepNumber, date } = req.body;

  if (!goal        || typeof goal        !== 'string' ||
      !category    || typeof category    !== 'string' ||
      !stepTitle   || typeof stepTitle   !== 'string' ||
      !stepDescription || typeof stepDescription !== 'string') {
    res.status(400).json({ error: 'goal, category, stepTitle, and stepDescription are required' });
    return;
  }

  try {
    const action = await getTodayAction({
      goal:            sanitize(goal, 200),
      category:        sanitize(category, 50),
      stepTitle:       sanitize(stepTitle, 200),
      stepDescription: sanitize(stepDescription, 500),
      stepNumber:      Number(stepNumber) || 1,
      date:            sanitize(String(date) || new Date().toLocaleDateString('en-CA'), 20),
    });
    res.json(action);
  } catch (err) {
    console.error('[action/today]', err);
    res.status(500).json({ error: 'Failed to generate today\'s action.' });
  }
});

router.post('/adjust', aiQuota, async (req: Request, res: Response) => {
  const { action, goal, category, type } = req.body;

  if (!action   || typeof action   !== 'string' ||
      !goal     || typeof goal     !== 'string' ||
      !category || typeof category !== 'string' ||
      !['swap', 'simplify'].includes(type)) {
    res.status(400).json({ error: 'action, goal, category, and type (swap|simplify) are required' });
    return;
  }

  try {
    const adjusted = await adjustAction({
      action: sanitize(action, 300),
      goal: sanitize(goal, 200),
      category: sanitize(category, 50),
      type: type as 'swap' | 'simplify',
    });
    res.json(adjusted);
  } catch (err) {
    console.error('[action/adjust]', err);
    res.status(500).json({ error: 'Failed to adjust action.' });
  }
});

export default router;
