import { Request, Response, NextFunction } from 'express';
import { AI_QUOTA } from '../config/constants';
import { quotaEnabled } from '../db/pool';
import { incrementAndCount, refundOne } from '../db/usage';

type Tier = 'free' | 'premium';

/**
 * Resolve the caller's entitlement tier.
 *
 * Phase A stub: everyone is 'free'. There are no premium users yet, so this
 * safely protects the AI budget today. When RevenueCat lands (Increment 4),
 * this becomes a cached server-side lookup by appUserId — the client's claimed
 * status is never trusted here.
 */
async function resolveTier(_userId: string): Promise<Tier> {
  return 'free';
}

function limitFor(tier: Tier): number {
  return tier === 'premium'
    ? AI_QUOTA.premiumDailyGenerations
    : AI_QUOTA.freeDailyGenerations;
}

/**
 * INTERIM identity resolution — Phase A cost-control only, not auth.
 *
 * Limitations:
 * - The mobile app does not yet send x-user-id, so all real clients fall back
 *   to ip:${req.ip}. Users behind carrier-grade NAT or shared Wi-Fi share a
 *   single quota bucket.
 * - x-user-id is caller-supplied and not verified; anyone with the API secret
 *   can rotate it to bypass quota.
 *
 * Both limitations are acceptable until Increment 4 wires RevenueCat
 * server-side verification and the mobile app forwards its stable appUserId.
 */
function resolveUserId(req: Request): string {
  const header = req.header('x-user-id');
  if (header && header.trim()) return header.trim().slice(0, 128);
  return `ip:${req.ip}`;
}

/**
 * Meters discretionary AI generations per user per day. Mount on the routes
 * that cost real money (plan generation, action adjust) — NOT the core daily
 * action. Inert (pass-through) until DATABASE_URL is configured.
 */
export async function aiQuota(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!quotaEnabled()) {
    next();
    return;
  }

  const userId = resolveUserId(req);

  try {
    const tier = await resolveTier(userId);
    const limit = limitFor(tier);
    const count = await incrementAndCount(userId);

    if (count > limit) {
      res.status(429).json({
        error: tier === 'free'
          ? 'Daily free generation limit reached. Upgrade to Premium for more.'
          : 'Daily generation limit reached. Please try again tomorrow.',
        upgrade: tier === 'free',
        used: limit,
        limit,
        tier,
      });
      return;
    }

    // Refund the metered unit on any non-2xx response: 4xx means validation
    // rejected the request before any AI work happened; 5xx means a transient
    // server/Claude error. Neither should cost the user a generation.
    res.on('finish', () => {
      if (res.statusCode >= 400) void refundOne(userId);
    });

    next();
  } catch (err) {
    // Fail OPEN: a quota/DB hiccup must not block generations. This is
    // cost-control, not an auth gate — a brief overage beats an outage.
    console.error('[quota] check failed, allowing request:', (err as Error).message);
    next();
  }
}
