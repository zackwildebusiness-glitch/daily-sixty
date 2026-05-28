import { CategoryId, Step, TodayAction } from '../store/types';
import { API_BASE_URL, API_PATHS, API_SECRET } from '../config/api';
import { useAppStore } from '../store';

async function post<T>(path: string, body: object, timeoutMs = 30_000): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_SECRET) {
    headers['Authorization'] = `Bearer ${API_SECRET}`;
  }
  headers['x-user-id'] = useAppStore.getState().installId;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    throw new Error(isAbort ? `Request timed out after ${timeoutMs / 1000}s` : String(err));
  }
  clearTimeout(timer);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export interface GeneratePlanParams {
  goal: string;
  category: CategoryId;
  level: string;
  successType: string;
}

export async function generatePlan(params: GeneratePlanParams): Promise<Step[]> {
  const data = await post<{ steps: Step[] }>(API_PATHS.generatePlan, params);
  return data.steps;
}

export interface AdjustActionParams {
  action: string;
  goal: string;
  category: CategoryId;
  type: 'swap' | 'simplify';
}

export async function adjustAction(params: AdjustActionParams): Promise<TodayAction> {
  const data = await post<{ title: string; why: string; minutes: number }>(
    API_PATHS.adjustAction, params
  );
  // Use local date (en-CA always returns YYYY-MM-DD) to match getToday() in utils
  return { ...data, date: new Date().toLocaleDateString('en-CA') };
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
  const data = await post<{ title: string; why: string; minutes: number }>(
    API_PATHS.todayAction, params
  );
  return { ...data, date: params.date };
}

export interface WeeklyReflectionParams {
  goalName: string;
  category: CategoryId;
  completedDays: number;
  currentStep: number;
  streak: number;
}

export async function getWeeklyReflection(params: WeeklyReflectionParams): Promise<string> {
  const data = await post<{ text: string }>(API_PATHS.weeklyReflection, params);
  return data.text;
}
