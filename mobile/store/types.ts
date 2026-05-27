export type CategoryId =
  | 'health'
  | 'career'
  | 'finance'
  | 'learning'
  | 'relationships'
  | 'creativity'
  | 'mindset'
  | 'custom';

export interface Step {
  title: string;
  description: string;
  duration: string;
}

export interface TodayAction {
  title: string;
  why: string;
  minutes: number;
  date: string; // YYYY-MM-DD
}

export interface Completion {
  date: string;     // YYYY-MM-DD
  goalId: string;
  completedAt: string; // ISO timestamp
  reflection?: 'up' | 'down';
}

export interface Goal {
  id: string;
  shortName: string;
  fullName: string;
  category: CategoryId;
  currentStep: number; // 1–7
  steps: Step[];
  todayAction: TodayAction | null;
  completions: Completion[];
  streak: number;
  bestStreak: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string; // ISO
}

export interface User {
  name: string;
  email?: string;
  reminderTime: string; // HH:MM
  isPro: boolean;
  notifications: boolean;  // Daily reminder toggle
  streakAlerts: boolean;   // Streak-protection alert toggle
  haptics: boolean;        // Haptic feedback toggle
  themeId?: string;        // palette id — undefined means 'violet' (default)
}

export interface CreateFlowState {
  category: CategoryId | null;
  goalText: string;
  level: string | null;
  successType: string | null;
  generatedSteps: Step[] | null;
}
