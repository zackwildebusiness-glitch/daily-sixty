import { afterEach, describe, expect, it, vi } from 'vitest';
import { computeStreak } from './utils';

function localDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-CA');
}

describe('computeStreak', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts a completion from today as a one-day streak', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 27, 12));

    expect(computeStreak([{ date: localDate(0) }])).toBe(1);
  });

  it('stops when yesterday is missing', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 27, 12));

    expect(computeStreak([{ date: localDate(0) }, { date: localDate(2) }])).toBe(1);
  });

  it('counts consecutive multi-day completions through today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 27, 12));

    expect(computeStreak([
      { date: localDate(0) },
      { date: localDate(1) },
      { date: localDate(2) },
    ])).toBe(3);
  });
});
