import { getPool } from './pool';

let schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const pool = getPool();
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      user_id     TEXT NOT NULL,
      period_date DATE NOT NULL,
      count       INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, period_date)
    )
  `);
  schemaReady = true;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Atomically increment today's generation count for a user and return the new
 * total. The single UPSERT is race-safe: concurrent requests serialize on the
 * primary key, so two in-flight calls can't both read a stale count and slip
 * past the limit. The caller compares the returned value against the tier limit.
 */
export async function incrementAndCount(userId: string): Promise<number> {
  await ensureSchema();
  const pool = getPool();
  if (!pool) return 0;
  const { rows } = await pool.query(
    `INSERT INTO ai_usage (user_id, period_date, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, period_date)
     DO UPDATE SET count = ai_usage.count + 1
     RETURNING count`,
    [userId, todayUTC()]
  );
  return rows[0].count as number;
}

/** Give back one unit — used when the metered generation ultimately failed. */
export async function refundOne(userId: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(
      `UPDATE ai_usage SET count = GREATEST(0, count - 1)
       WHERE user_id = $1 AND period_date = $2`,
      [userId, todayUTC()]
    );
  } catch (err) {
    console.error('[usage] refund failed:', (err as Error).message);
  }
}
