import { Router, Request, Response } from 'express';
import { getWeeklyReflection } from '../services/claude';

const router = Router();

const sanitize = (s: string, max: number) =>
  String(s).trim().slice(0, max).replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ').trim();

router.post('/weekly', async (req: Request, res: Response) => {
  const { goalName, category, completedDays, currentStep, streak } = req.body;

  if (!goalName || !category) {
    res.status(400).json({ error: 'goalName and category are required' });
    return;
  }

  try {
    const text = await getWeeklyReflection({
      goalName:     sanitize(String(goalName), 200),
      category:     sanitize(String(category), 50),
      completedDays: Number(completedDays) || 0,
      currentStep:   Number(currentStep) || 1,
      streak:        Number(streak) || 0,
    });
    res.json({ text });
  } catch (err) {
    console.error('[reflection/weekly]', err);
    res.status(500).json({ error: 'Failed to generate reflection.' });
  }
});

export default router;
