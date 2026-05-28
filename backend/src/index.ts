import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { RATE_LIMIT } from './config/constants';

import planRouter from './routes/plan';
import actionRouter from './routes/action';
import reflectionRouter from './routes/reflection';

const app = express();

// Tell Express to trust the first proxy hop (Railway/Render/Fly pass X-Forwarded-For).
// Without this, req.ip resolves to the proxy address and every client shares one
// rate-limit / quota bucket instead of being bucketed by real IP.
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: env.isDev ? RATE_LIMIT.maxDev : RATE_LIMIT.maxProd,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── API key guard ─────────────────────────────────────────────────────────────
//
// Requires clients to send: Authorization: Bearer <API_SECRET>
//
// WHY: Prevents casual discovery + use of the backend by third parties who
// would drain the Anthropic API budget at the operator's expense.
//
// LIMITS: The secret lives in the mobile bundle (EXPO_PUBLIC_API_SECRET) and
// can be extracted by decompiling the APK. This is a deterrent, not true
// security. Production deployments should add user-level JWT authentication.
//
// Skip the check entirely in development (empty API_SECRET) so developers
// don't need to configure the variable locally.
function apiKeyGuard(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!env.apiSecret) {
    // No secret configured — allow all requests (development / first-run mode)
    next();
    return;
  }

  const auth = req.headers['authorization'];
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

  if (token !== env.apiSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/plan',        apiKeyGuard, planRouter);
app.use('/api/action',      apiKeyGuard, actionRouter);
app.use('/api/reflection',  apiKeyGuard, reflectionRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(env.port, () => {
  console.log(`✅ Daily 60 backend on http://localhost:${env.port} [${env.nodeEnv}]`);
  console.log(`   API key: ${env.anthropicApiKey ? 'set ✓' : 'MISSING ✗'}`);
  console.log(`   CORS origin: ${env.clientOrigin}`);
});
