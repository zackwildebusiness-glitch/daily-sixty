import { afterEach, describe, expect, it, vi } from 'vitest';
import { computeStreak, generateInstallId } from './utils';

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

describe('generateInstallId', () => {
  it('uses the platform UUID API when available', () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    });

    expect(generateInstallId()).toBe('install_00000000-0000-4000-8000-000000000000');

    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto,
    });
  });

  it('falls back without crashing when crypto.randomUUID is unavailable', () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: undefined,
    });

    expect(generateInstallId()).toMatch(/^install_[a-z0-9]+$/);

    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto,
    });
  });
});
