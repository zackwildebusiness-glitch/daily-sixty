import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import {
  Goal,
  User,
  CreateFlowState,
  CategoryId,
  TodayAction,
  Step,
  Completion,
} from './types';
import { generateGoalId, getToday, computeStreak, shortenName } from '../lib/utils';

const mmkv = createMMKV({ id: 'daily60-store' });

const mmkvStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};

interface AppStore {
  // State
  user: User | null;
  goals: Goal[];
  activeGoalId: string | null;
  hasSeenOnboarding: boolean;
  createFlow: CreateFlowState;

  // User actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setHasSeenOnboarding: () => void;
  setUserPro: (isPro: boolean) => void;
  updateUserPrefs: (prefs: Partial<Pick<User, 'notifications' | 'streakAlerts' | 'haptics' | 'reminderTime' | 'themeId'>>) => void;

  // Goal actions
  setActiveGoal: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  pauseGoal: (id: string) => void;
  resumeGoal: (id: string) => void;
  abandonGoal: (id: string) => void;
  completeAction: (goalId: string) => void;
  setTodayAction: (goalId: string, action: TodayAction) => void;

  // Create flow
  setCreateFlow: (updates: Partial<CreateFlowState>) => void;
  resetCreateFlow: () => void;

  // Computed helpers
  getActiveGoal: () => Goal | undefined;
  isTodayCompleted: (goalId: string) => boolean;
}

const defaultCreateFlow: CreateFlowState = {
  category: null,
  goalText: '',
  level: null,
  successType: null,
  generatedSteps: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      goals: [],
      activeGoalId: null,
      hasSeenOnboarding: false,
      createFlow: defaultCreateFlow,

      setUser: (user) => set({ user }),

      /**
       * Wipes ALL persistent state — goals, user, onboarding flag.
       * Called by "Delete account". Resets to factory-fresh state so
       * the user sees the splash/onboarding flow on next launch.
       */
      clearUser: () => set({
        user: null,
        goals: [],
        activeGoalId: null,
        hasSeenOnboarding: false,
        createFlow: defaultCreateFlow,
      }),

      setHasSeenOnboarding: () => set({ hasSeenOnboarding: true }),

      /**
       * Marks the current user as Pro. Creates a minimal user object if
       * none exists (supports the no-auth flow where user can be null).
       */
      setUserPro: (isPro) => set((state) => ({
        user: state.user
          ? { ...state.user, isPro }
          : { name: 'User', reminderTime: '08:00', isPro, notifications: true, streakAlerts: true, haptics: true },
      })),

      /**
       * Updates notification / haptic preference fields on the user.
       * No-ops if user is null (shouldn't happen in practice — prefs UI
       * is only reachable after at least one goal is created).
       */
      updateUserPrefs: (prefs) => set((state) => ({
        user: state.user ? { ...state.user, ...prefs } : state.user,
      })),

      setActiveGoal: (id) => set({ activeGoalId: id }),

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
          activeGoalId: goal.id,
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      pauseGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, status: 'paused' as const } : g
          ),
        })),

      resumeGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, status: 'active' as const } : g
          ),
        })),

      abandonGoal: (id) =>
        set((state) => {
          const remaining = state.goals.filter((g) => g.id !== id);
          const newActive = state.activeGoalId === id
            ? (remaining.find((g) => g.status === 'active')?.id ?? null)
            : state.activeGoalId;
          return { goals: remaining, activeGoalId: newActive };
        }),

      completeAction: (goalId) =>
        set((state) => {
          const today = getToday();
          const updatedGoals = state.goals.map((g) => {
            if (g.id !== goalId) return g;

            const alreadyDone = g.completions.some(
              (c) => c.date === today && c.goalId === goalId
            );
            if (alreadyDone) return g;

            const newCompletion: Completion = {
              date: today,
              goalId,
              completedAt: new Date().toISOString(),
            };
            const newCompletions = [...g.completions, newCompletion];
            const newStreak = computeStreak(newCompletions);

            /**
             * STEP ADVANCEMENT LOGIC
             * Each step takes 7 days of completions (consecutive or cumulative).
             * After every 7 completions total, currentStep advances by 1.
             *
             *   0–6  completions  → Step 1
             *   7–13 completions  → Step 2
             *   ...
             *   42–48 completions → Step 7
             *   49    completions → Goal auto-completed
             *
             * When the step changes, todayAction is cleared so a fresh
             * action for the new step is fetched on the next app open.
             */
            const DAYS_PER_STEP = 7;
            const TOTAL_STEPS = 7;
            const newStep = Math.min(TOTAL_STEPS, Math.floor(newCompletions.length / DAYS_PER_STEP) + 1);
            const stepAdvanced = newStep !== g.currentStep;

            // Mark goal completed after finishing all 7 steps (49 completions)
            const goalCompleted = newCompletions.length >= TOTAL_STEPS * DAYS_PER_STEP;

            return {
              ...g,
              completions: newCompletions,
              streak: newStreak,
              bestStreak: Math.max(g.bestStreak, newStreak),
              currentStep: newStep,
              status: goalCompleted ? 'completed' as const : g.status,
              // Reset cached action so a new action for the new step is fetched
              todayAction: stepAdvanced ? null : g.todayAction,
            };
          });

          // If the completed goal transitioned to 'completed' status,
          // auto-switch activeGoalId to the next active goal so the home
          // screen doesn't show an empty state unexpectedly.
          const justCompletedGoal = updatedGoals.find(
            (g) => g.id === goalId && g.status === 'completed'
          );
          const wasActive = state.activeGoalId === goalId;
          let newActiveGoalId = state.activeGoalId;

          if (justCompletedGoal && wasActive) {
            const nextActive = updatedGoals.find(
              (g) => g.id !== goalId && g.status === 'active'
            );
            newActiveGoalId = nextActive?.id ?? null;
          }

          return { goals: updatedGoals, activeGoalId: newActiveGoalId };
        }),

      setTodayAction: (goalId, action) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, todayAction: action } : g
          ),
        })),

      setCreateFlow: (updates) =>
        set((state) => ({
          createFlow: { ...state.createFlow, ...updates },
        })),

      resetCreateFlow: () => set({ createFlow: defaultCreateFlow }),

      getActiveGoal: () => {
        const state = get();
        return state.goals.find((g) => g.id === state.activeGoalId);
      },

      isTodayCompleted: (goalId) => {
        const state = get();
        const today = getToday();
        const goal = state.goals.find((g) => g.id === goalId);
        return goal?.completions.some((c) => c.date === today) ?? false;
      },
    }),
    {
      name: 'daily60-app',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

// Helper to build a new Goal object from create flow
export function buildGoalFromFlow(
  goalText: string,
  category: CategoryId,
  steps: Step[]
): Goal {
  return {
    id: generateGoalId(),
    shortName: shortenName(goalText),
    fullName: goalText,
    category,
    currentStep: 1,
    steps,
    todayAction: null,
    completions: [],
    streak: 0,
    bestStreak: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}
