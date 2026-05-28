import type { Step, CategoryId } from '../store/types';

/**
 * Returns today's date as YYYY-MM-DD in the **device's local timezone**.
 *
 * WHY NOT `.toISOString()`?
 * `toISOString()` returns UTC. For a user in UTC-8 who completes their
 * action at 11 PM local time (7 AM next day UTC), the date stored would be
 * tomorrow — breaking their streak. `toLocaleDateString('en-CA')` uses the
 * ISO date format (YYYY-MM-DD) but in the device's local timezone.
 */
export function getToday(): string {
  return new Date().toLocaleDateString('en-CA'); // 'en-CA' locale always formats as YYYY-MM-DD
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export function shortenName(text: string): string {
  if (!text) return 'New goal';
  if (text.length <= 22) return text;
  return text.split(' ').slice(0, 3).join(' ');
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function nextActionIn(completedAt?: string): string {
  if (!completedAt) return '';
  // Base midnight on TODAY (device local time), not on the completion timestamp.
  // Using the completion timestamp as the base causes an off-by-UTC-offset error.
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - Date.now();
  if (diffMs <= 0) return 'now';
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

/** Returns the local YYYY-MM-DD string for a given Date object. */
function toLocalDate(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

export function computeStreak(completions: { date: string }[]): number {
  if (!completions.length) return 0;
  const dates = new Set(completions.map(c => c.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDate(d);
    if (dates.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getWeekHistory(completions: { date: string; goalId: string }[], goalId: string): boolean[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toLocalDate(d);
    return completions.some(c => c.date === key && c.goalId === goalId);
  });
}

export function generateGoalId(): string {
  return 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function generateInstallId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === 'function') {
    return `install_${randomUUID.call(globalThis.crypto)}`;
  }

  // Non-security identifier used only for quota bucketing before real auth.
  return 'install_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

// Fallback plan if backend is unavailable
export function buildFallbackPlan(goal: string, category: CategoryId): Step[] {
  const templates: Record<CategoryId, Step[]> = {
    health: [
      { title: 'Foundation — Honest baseline', duration: '15 min/day', description: 'Time a casual walk. Note your resting heart rate. Pick the right gear. Capture where you actually are.' },
      { title: 'Build the habit, not the intensity', duration: '20 min/day', description: 'Walk-jog intervals 3×/week. 1 min effort, 2 min recovery, repeat 6×. Off days: 10-minute mobility.' },
      { title: 'Stretch the effort', duration: '25 min/day', description: 'Shift intervals to 2 min on, 1 min recovery. Add one steady 10-minute easy effort per week.' },
      { title: 'Go continuous', duration: '30 min/day', description: 'Drop the breaks. Three 15-minute easy continuous sessions, plus one 20-minute effort this week.' },
      { title: 'Mid-point check & form tune', duration: '25 min/day', description: 'Time yourself. Capture pace and effort. Quick form drills 2×/week — posture, breathing, cadence.' },
      { title: 'Long enough is the win', duration: '30 min/day', description: 'One 25-minute easy long session. Two shorter sessions. Practice pacing and fueling.' },
      { title: 'The finish line (and what\'s next)', duration: '40 min', description: 'Complete the milestone at easy effort. Aim to finish, not race. Decide your next challenge.' },
    ],
    career: [
      { title: 'Clarity — Define the real goal', duration: '15 min/day', description: 'Write exactly what you want and why in one clear sentence. Vague goals produce vague results.' },
      { title: 'Audit your current position', duration: '15 min/day', description: 'List your skills, gaps, and assets. Honest self-assessment is the strategy.' },
      { title: 'Build the knowledge base', duration: '20 min/day', description: 'Read, watch, or listen to one piece of content per day directly related to your target role or outcome.' },
      { title: 'Make something visible', duration: '20 min/day', description: 'Create or update one piece of public work — LinkedIn, portfolio, GitHub, writing. Be findable.' },
      { title: 'Reach out', duration: '15 min/day', description: 'Send one genuine message per day — not to ask for something, but to give value first.' },
      { title: 'Apply or pitch', duration: '25 min/day', description: 'Submit one targeted application or pitch per day. Quality beats volume.' },
      { title: 'Reflect and iterate', duration: '20 min/day', description: 'What\'s working? What isn\'t? Adjust and keep going. Persistence beats talent at the start.' },
    ],
    finance: [
      { title: 'Baseline — The real numbers', duration: '15 min/day', description: 'Pull every account balance. Write the truth. You can\'t fix what you can\'t see.' },
      { title: 'Stop the leaks', duration: '15 min/day', description: 'List every subscription and recurring charge. Cancel anything you haven\'t used this month.' },
      { title: 'Build the budget', duration: '15 min/day', description: 'Allocate every dollar before the month starts. Use the 50/30/20 rule as a starting template.' },
      { title: 'Automate the saves', duration: '10 min/day', description: 'Set up one automatic transfer on payday. Automation beats willpower every time.' },
      { title: 'Increase income', duration: '20 min/day', description: 'Identify one way to earn more — negotiate, freelance, sell something. Small wins compound.' },
      { title: 'Track and audit weekly', duration: '15 min/day', description: 'Review every transaction once per week. Awareness is the habit.' },
      { title: 'The milestone hit', duration: '15 min', description: 'You hit the target. Now set the next one. The system works — keep it running.' },
    ],
    learning: [
      { title: 'Pick the stack', duration: '15 min/day', description: 'Choose your list. Set order. Get the first resource accessible. Decision fatigue kills starts.' },
      { title: 'Daily reading floor', duration: '15 min/day', description: '15 dedicated minutes. Same chair, same time. Phone in another room.' },
      { title: 'Read and capture', duration: '15 min/day', description: 'After each session, write one sentence in your notes. Just one — it anchors the session.' },
      { title: 'Finish the first, start the second', duration: '15 min/day', description: 'Wrap up with a 3-sentence summary. Begin the next resource with the same ritual.' },
      { title: 'Variable formats', duration: '15 min/day', description: 'Mix audio on commutes and walks. Goal is volume of attention, not virtue of format.' },
      { title: 'Share publicly', duration: '15 min/day', description: 'Post one takeaway somewhere visible. Accountability plus reinforcement.' },
      { title: 'Stretch goal', duration: '15 min/day', description: 'You\'re on pace. Decide depth over breadth or breadth over depth — and continue.' },
    ],
    relationships: [
      { title: 'Map the relationships', duration: '15 min/day', description: 'Write down the 5 people who matter most. When did you last meaningfully connect with each?' },
      { title: 'Reach out first', duration: '15 min/day', description: 'Send one thoughtful message per day. No agenda. Just genuine interest.' },
      { title: 'Show up in person', duration: '20 min/day', description: 'Schedule one face-to-face time this week. Presence is the highest form of attention.' },
      { title: 'Listen deeply', duration: '15 min/day', description: 'In every conversation today, ask one follow-up question. Don\'t talk about yourself unless asked.' },
      { title: 'Celebrate others', duration: '10 min/day', description: 'Acknowledge a win, birthday, or milestone for someone in your circle. People remember who showed up.' },
      { title: 'Be reliable', duration: '15 min/day', description: 'Do what you said you\'d do. Follow up on every open thread from the past month.' },
      { title: 'The long game', duration: '15 min', description: 'Relationships compound over years. Review what\'s improved and set your next intention.' },
    ],
    creativity: [
      { title: 'Foundation — Pick your project', duration: '15 min/day', description: 'Choose one specific creative project. Clear scope, clear finish line. Vague creativity dies.' },
      { title: 'Show up before you\'re ready', duration: '15 min/day', description: '15 minutes of making, no editing. Quantity over quality at this stage. Volume builds skill.' },
      { title: 'Learn one new technique', duration: '20 min/day', description: 'Watch or read one tutorial. Then immediately apply it — even badly.' },
      { title: 'Full draft, slow', duration: '20 min/day', description: 'Create a complete rough version end-to-end. Imperfect is the only path to finished.' },
      { title: 'Refine with intention', duration: '20 min/day', description: 'Pick the weakest part of your draft. Fix just that. Repeat daily.' },
      { title: 'Show it to someone', duration: '15 min/day', description: 'Share with one person. Feedback is data. Don\'t defend — listen.' },
      { title: 'Finish and publish', duration: '15 min', description: 'Done is better than perfect. Ship it. Then immediately start the next one.' },
    ],
    mindset: [
      { title: 'Name the pattern you want to change', duration: '10 min/day', description: 'Write it down. What specifically do you want to stop or start? Precise language creates precise change.' },
      { title: 'Morning anchor', duration: '10 min/day', description: '5 minutes of stillness before any screen. Every morning. Non-negotiable.' },
      { title: 'Thought audit', duration: '15 min/day', description: 'Write 3 thoughts that are holding you back. Then rewrite each one as its opposite. Practice both versions.' },
      { title: 'Gratitude practice', duration: '10 min/day', description: 'Write 3 specific things you\'re grateful for. Not vague — specific. What happened? Why did it matter?' },
      { title: 'One hard thing', duration: '20 min/day', description: 'Do the one thing you\'ve been avoiding. Every day. Discomfort is the signal you\'re growing.' },
      { title: 'Evening review', duration: '10 min/day', description: 'What went well? What\'s one thing you\'d do differently? Write it. Sleep better.' },
      { title: 'Sustain the practice', duration: '10 min/day', description: 'You\'ve built the habit. Now protect it. Review and recommit to what\'s working.' },
    ],
    custom: [
      { title: 'Define success clearly', duration: '15 min/day', description: 'Write exactly what done looks like. Measurable. Specific. Dated.' },
      { title: 'Build the foundation', duration: '20 min/day', description: 'Research the basics. Understand what skills or resources you need to start.' },
      { title: 'Take the first real step', duration: '20 min/day', description: 'Do something tangible today — not research, not planning. Make something happen.' },
      { title: 'Establish the rhythm', duration: '20 min/day', description: 'Find your daily practice. Small and consistent beats big and sporadic every time.' },
      { title: 'Push past the plateau', duration: '25 min/day', description: 'Every goal has a boring middle. This is it. Show up anyway.' },
      { title: 'Build toward the finish', duration: '25 min/day', description: 'You can see the end. Focus on completion, not perfection.' },
      { title: 'Cross the finish line', duration: '30 min', description: 'Complete the milestone. Celebrate. Choose your next goal.' },
    ],
  };
  return templates[category] ?? templates.custom;
}
