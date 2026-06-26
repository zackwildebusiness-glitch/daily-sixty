import { CategoryId, Step, TodayAction } from '../store/types';

// ── Web demo backend (no server) ──────────────────────────────────────────
// The real app calls a hosted, secret-protected AI backend that can't be
// exposed in a public client bundle. For the portfolio demo
// (zackwilde-dev.netlify.app/demos/daily60) Metro resolves this `.web.ts`
// file instead of `api.ts`, returning canned but representative content so the
// whole flow — onboarding, plan generation, daily actions, reflections — is
// explorable end to end. Native builds still hit the real API via api.ts.

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface GeneratePlanParams {
  goal: string;
  category: CategoryId;
  level: string;
  successType: string;
}

export async function generatePlan(params: GeneratePlanParams): Promise<Step[]> {
  await delay(1100);
  const goal = params.goal.trim() || 'your goal';
  return [
    { title: 'Set the foundation', description: `Define what real progress on "${goal}" looks like and remove one obstacle standing in the way.`, duration: 'Week 1' },
    { title: 'Lock in the daily window', description: 'Pick a consistent 60-minute slot and protect it. Show up every day, even on a small scale.', duration: 'Week 2' },
    { title: 'Build momentum', description: 'Stack a few easy wins so the habit feels automatic before the work gets harder.', duration: 'Week 3' },
    { title: 'Raise the bar', description: 'Increase the intensity or difficulty of each session now that the routine is stable.', duration: 'Week 4' },
    { title: 'Push through the dip', description: 'Expect motivation to fade here. Lean on the streak and keep the sessions non-negotiable.', duration: 'Week 5' },
    { title: 'Refine and focus', description: 'Cut what is not working and double down on the actions driving the most progress.', duration: 'Week 6' },
    { title: 'Finish strong', description: `Consolidate the gains and turn this into a lasting habit beyond "${goal}".`, duration: 'Week 7' },
  ];
}

export interface AdjustActionParams {
  action: string;
  goal: string;
  category: CategoryId;
  type: 'swap' | 'simplify';
}

export async function adjustAction(params: AdjustActionParams): Promise<TodayAction> {
  await delay(700);
  const today = new Date().toLocaleDateString('en-CA');
  if (params.type === 'simplify') {
    return {
      title: 'A smaller version of today’s action',
      why: 'Some days the win is just showing up. This trimmed-down step keeps your streak alive.',
      minutes: 15,
      date: today,
    };
  }
  return {
    title: 'A fresh take on today’s action',
    why: `A different angle on "${params.goal}" so today feels new while still moving you forward.`,
    minutes: 45,
    date: today,
  };
}

export interface GetTodayActionParams {
  goal: string;
  category: CategoryId;
  stepTitle: string;
  stepDescription: string;
  stepNumber: number;
  date: string;
}

export async function getTodayAction(params: GetTodayActionParams): Promise<TodayAction> {
  await delay(800);
  return {
    title: `Spend 60 focused minutes on "${params.stepTitle.toLowerCase()}"`,
    why: `This is the highest-leverage move for "${params.goal}" right now — step ${params.stepNumber} of your plan.`,
    minutes: 60,
    date: params.date,
  };
}

export interface WeeklyReflectionParams {
  goalName: string;
  category: CategoryId;
  completedDays: number;
  currentStep: number;
  streak: number;
}

export async function getWeeklyReflection(params: WeeklyReflectionParams): Promise<string> {
  await delay(900);
  return `You showed up ${params.completedDays} day${params.completedDays === 1 ? '' : 's'} this week on "${params.goalName}" and you're on step ${params.currentStep} of 7. A ${params.streak}-day streak is real momentum — the consistency matters far more than any single session. Keep protecting that daily window and next week will take care of itself.`;
}
