import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../db/pool', () => ({ quotaEnabled: vi.fn() }));
vi.mock('../db/usage', () => ({ incrementAndCount: vi.fn(), refundOne: vi.fn() }));

import { aiQuota } from './quota';
import { quotaEnabled } from '../db/pool';
import { incrementAndCount, refundOne } from '../db/usage';

function makeReq(headers: Record<string, string> = {}, ip = '1.2.3.4') {
  return {
    header: (name: string) => headers[name.toLowerCase()] ?? null,
    ip,
  } as unknown as Request;
}

function makeRes(initialStatus = 200) {
  const finishCbs: Array<() => void> = [];
  const res = {
    statusCode: initialStatus,
    status(code: number) { res.statusCode = code; return res; },
    json: vi.fn(() => res),
    on(event: string, cb: () => void) { if (event === 'finish') finishCbs.push(cb); },
    emit() { finishCbs.forEach(cb => cb()); },
  };
  return res as unknown as Response & { emit(): void };
}

describe('aiQuota', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('passes through when quota is disabled', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(false);
    await aiQuota(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
    expect(incrementAndCount).not.toHaveBeenCalled();
  });

  it('calls next when under the daily limit', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(1);
    await aiQuota(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 429 when the daily limit is exceeded', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(4); // 4 > 3 (free limit)
    const res = makeRes();
    await aiQuota(makeReq(), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(429);
  });

  it('refunds on a 4xx response (validation failure)', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(1);
    const res = makeRes();
    await aiQuota(makeReq(), res, next);
    res.statusCode = 400;
    res.emit();
    expect(refundOne).toHaveBeenCalledOnce();
  });

  it('refunds on a 5xx response (server error)', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(1);
    const res = makeRes();
    await aiQuota(makeReq(), res, next);
    res.statusCode = 500;
    res.emit();
    expect(refundOne).toHaveBeenCalledOnce();
  });

  it('does not refund on a 2xx response', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(1);
    const res = makeRes(200);
    await aiQuota(makeReq(), res, next);
    res.emit();
    expect(refundOne).not.toHaveBeenCalled();
  });

  it('fails open when the DB throws', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockRejectedValue(new Error('connection refused'));
    await aiQuota(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('uses x-user-id header when provided', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(1);
    await aiQuota(makeReq({ 'x-user-id': 'user-abc' }), makeRes(), next);
    expect(incrementAndCount).toHaveBeenCalledWith('user-abc');
  });

  it('falls back to IP when x-user-id is absent', async () => {
    vi.mocked(quotaEnabled).mockReturnValue(true);
    vi.mocked(incrementAndCount).mockResolvedValue(1);
    await aiQuota(makeReq({}, '5.6.7.8'), makeRes(), next);
    expect(incrementAndCount).toHaveBeenCalledWith('ip:5.6.7.8');
  });
});
