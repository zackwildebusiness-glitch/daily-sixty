import { env } from '../config/env';

// Lazy Postgres pool. We deliberately `require('pg')` at first use rather than
// importing it at module load, so the backend starts and type-checks even when
// `pg` isn't installed or no DATABASE_URL is configured. The quota system is
// inert in that case — see middleware/quota.ts.

let pool: any = null;
let resolved = false;

export function quotaEnabled(): boolean {
  return !!env.databaseUrl;
}

export function getPool(): any {
  if (resolved) return pool;
  resolved = true;

  if (!env.databaseUrl) {
    pool = null;
    return null;
  }

  const { Pool } = require('pg');
  pool = new Pool({ connectionString: env.databaseUrl, max: 5 });
  pool.on('error', (err: Error) => {
    console.error('[db] idle client error:', err.message);
  });
  return pool;
}
