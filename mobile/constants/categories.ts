import { CategoryId } from '../store/types';

export interface Category {
  id: CategoryId;
  label: string;
  subtitle: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'health',        label: 'Health & Fitness',  subtitle: 'Body, energy, sleep',   icon: 'cat-health' },
  { id: 'career',        label: 'Career & Work',     subtitle: 'Job, skills, growth',   icon: 'cat-career' },
  { id: 'finance',       label: 'Finance & Money',   subtitle: 'Save, earn, invest',    icon: 'cat-finance' },
  { id: 'learning',      label: 'Learning & Skills', subtitle: 'Read, study, master',   icon: 'cat-learning' },
  { id: 'relationships', label: 'Relationships',     subtitle: 'Family, friends, love', icon: 'cat-relationships' },
  { id: 'creativity',    label: 'Creativity',        subtitle: 'Make, write, play',     icon: 'cat-creativity' },
  { id: 'mindset',       label: 'Mindset',           subtitle: 'Calm, focus, joy',      icon: 'cat-mindset' },
  { id: 'custom',        label: 'Something else',    subtitle: 'Define your own',       icon: 'cat-custom' },
];

export const EXAMPLE_GOALS: Record<CategoryId, string[]> = {
  health:        ['Run a 5K without stopping', 'Work out 4 times a week', 'Sleep 8 hours every night', 'Lose 10 lbs by summer', 'Walk 10,000 steps a day', 'Cut out sugar for 60 days'],
  career:        ['Get promoted this year', 'Land my first freelance client', 'Switch careers into tech', 'Build a portfolio I\'m proud of', 'Start a side business', 'Give a talk at a meetup'],
  finance:       ['Save my first $5,000', 'Pay off my credit card', 'Build a 3-month emergency fund', 'Start investing every month', 'Stick to a monthly budget', 'Negotiate a pay rise'],
  learning:      ['Read 12 books this year', 'Learn conversational Spanish', 'Pass my AWS certification', 'Learn to code in Python', 'Complete an online course', 'Learn to touch-type'],
  relationships: ['Call family more often', 'Make one new real friend', 'Have a weekly date night', 'Be more present with my kids', 'Reconnect with old friends', 'Stop cancelling on people'],
  creativity:    ['Learn to play guitar', 'Write and finish a short story', 'Paint 30 pieces this year', 'Start a YouTube channel', 'Build something with my hands', 'Learn photography basics'],
  mindset:       ['Build a daily meditation habit', 'Stop doomscrolling at night', 'Journal every morning', 'Complain less, act more', 'Spend less time on my phone', 'Practice gratitude daily'],
  custom:        ['Run a 5K', 'Learn guitar', 'Start a side business', 'Read more books', 'Get healthier', 'Learn something new'],
};

export const MOTIVATIONAL_QUOTES = [
  'You will never always be motivated. You have to learn to be disciplined.',
  'Small daily improvements lead to staggering long-term results.',
  'The secret of getting ahead is getting started.',
  "Don't watch the clock; do what it does. Keep going.",
  'One hour of focused work beats eight hours of distraction.',
  'Progress, not perfection.',
  'Show up. That is 80% of it.',
];

export function getCategoryById(id: CategoryId): Category {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[7];
}
