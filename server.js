// ── Ichnite Backend Server ──
// Proxy server that keeps API keys hidden from the browser
// All external API calls go through here — never directly from app.js

// ── Load environment variables first ──
import 'dotenv/config';

// ── Imports ──
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';
import net from 'node:net';
import { randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Resolve __dirname (not available by default in ES modules) ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Validate required environment variables on startup ──
const requiredEnvVars = ['HELIUS_API_KEY'];

requiredEnvVars.forEach((key) => {
  const value = process.env[key];

  if (
    !value ||
    value.trim() === '' ||
    value.includes('your_') ||
    value.includes('_here')
  ) {
    console.warn(`⚠️ Warning: ${key} is missing or still using the placeholder value.`);
  }
});

// ── Express App ──
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.trim() || '';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || '';
const REDIS_KEY_PREFIX =
  (process.env.REDIS_KEY_PREFIX || 'ichnite:rate-limit:').trim() ||
  'ichnite:rate-limit:';
const REDIS_KEY_PREFIX_SOURCE =
  process.env.REDIS_KEY_PREFIX?.trim() ? 'configured' : 'default';

const REDIS_BACKUP_ENABLED = Boolean(REDIS_URL && REDIS_TOKEN);
const redis = REDIS_BACKUP_ENABLED
  ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
  : null;

const FEEDBACK_REDIS_KEY_PREFIX =
  (process.env.FEEDBACK_REDIS_KEY_PREFIX || 'ichnite:feedback:').trim() ||
  'ichnite:feedback:';
const FEEDBACK_REDIS_KEY_PREFIX_SOURCE =
  process.env.FEEDBACK_REDIS_KEY_PREFIX?.trim()
    ? 'configured'
    : 'default';

const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim() || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() || '';
const FEEDBACK_RECIPIENT_EMAIL =
  process.env.FEEDBACK_RECIPIENT_EMAIL?.trim() || '';

const BREVO_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL?.trim() || '';

const RESEND_SENDER_EMAIL =
  process.env.RESEND_SENDER_EMAIL?.trim() || '';

const FEEDBACK_SENDER_NAME =
  process.env.FEEDBACK_SENDER_NAME?.trim() || 'Ichnite';

function isValidTrustProxyToken(token) {
  const value = token.trim();
  if (!value) return false;

  const lower = value.toLowerCase();
  if (['loopback', 'linklocal', 'uniquelocal'].includes(lower)) return true;

  if (net.isIP(value) !== 0) return true;

  const cidrMatch = value.match(/^(.+)\/(\d{1,3})$/);
  if (!cidrMatch) return false;

  const [, ipPart, prefixPart] = cidrMatch;
  const ipVersion = net.isIP(ipPart.trim());
  if (ipVersion === 0) return false;

  const prefix = Number(prefixPart);
  if (!Number.isInteger(prefix)) return false;

  return ipVersion === 4 ? prefix >= 0 && prefix <= 32 : prefix >= 0 && prefix <= 128;
}

function parseTrustProxySetting(rawValue) {
  if (rawValue == null) return false;

  const value = String(rawValue).trim();
  if (value === '') return false;

  const lower = value.toLowerCase();
  if (['false', 'off', 'no', 'none', 'true'].includes(lower)) return false;

  if (/^\d+$/.test(value)) return Number(value);

  const tokens = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (tokens.length === 0) return false;

  if (!tokens.every(isValidTrustProxyToken)) {
    console.warn(`⚠️ Ignoring invalid TRUST_PROXY value: ${value}`);
    return false;
  }

  return tokens.length === 1 ? tokens[0] : tokens;
}

function parseAllowedOrigins(rawValue) {
  if (rawValue == null) return [];

  const values = String(rawValue)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const origins = [];

  for (const origin of values) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        console.warn(`⚠️ Ignoring unsupported ALLOWED_ORIGINS value: ${origin}`);
        continue;
      }
      origins.push(parsed.origin);
    } catch {
      console.warn(`⚠️ Ignoring invalid ALLOWED_ORIGINS value: ${origin}`);
    }
  }

  return origins;
}

function isDevelopmentLocalOrigin(origin) {
  return (
    /^http:\/\/localhost(?::\d+)?$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin) ||
    /^http:\/\/\[::1\](?::\d+)?$/.test(origin)
  );
}

function describeTrustProxySetting(setting) {
  if (setting === false) return 'false (no proxy trusted)';
  if (typeof setting === 'number') return `hop count ${setting}`;
  if (Array.isArray(setting)) return `trusted sources [${setting.join(', ')}]`;
  return `trusted source ${setting}`;
}

const trustProxySetting = parseTrustProxySetting(process.env.TRUST_PROXY);
const configuredOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
const developmentOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

if (
  process.env.TRUST_PROXY &&
  String(process.env.TRUST_PROXY).trim().toLowerCase() !== 'false' &&
  trustProxySetting === false
) {
  console.warn('⚠️ TRUST_PROXY is missing, empty, or invalid. Falling back to false.');
}

if (NODE_ENV !== 'development' && configuredOrigins.length === 0) {
  console.warn('⚠️ ALLOWED_ORIGINS is not set. Browser requests from a different origin will be blocked until you configure it.');
}

const allowedOrigins = new Set(configuredOrigins);
if (NODE_ENV === 'development') {
  developmentOrigins.forEach((origin) => allowedOrigins.add(origin));
}

app.set('trust proxy', trustProxySetting);

// ── Security Middleware — applied before all routes ──

// 1. Helmet — sets secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no Origin (Postman, curl, server-to-server)
    if (!origin) {
      console.log('✅ Allowing request with no Origin header');
      return callback(null, true);
    }

    console.log('Origin:', origin);

    // Allow explicitly configured frontend origins.
    // This is the primary production/deployment-independent mechanism.
    if (allowedOrigins.has(origin)) {
      console.log(`✅ Allowed configured origin: ${origin}`);
      return callback(null, true);
    }

    // Allow local development origins.
    if (NODE_ENV === 'development' && isDevelopmentLocalOrigin(origin)) {
      console.log(`✅ Allowed local development origin: ${origin}`);
      return callback(null, true);
    }

    // Allow GitHub Codespaces forwarded URLs during development only.
    // This does not affect production deployments because it requires
    // NODE_ENV === 'development' and a matching CODESPACE_NAME.
    if (NODE_ENV === 'development' && process.env.CODESPACE_NAME) {
      const codespaceName = process.env.CODESPACE_NAME.trim();

      const codespaceOriginRegex = new RegExp(
        `^https://${codespaceName}-\\d+\\.app\\.github\\.dev$`
      );

      if (codespaceOriginRegex.test(origin)) {
        console.log(`✅ Allowed GitHub Codespaces origin: ${origin}`);
        return callback(null, true);
      }
    }

    console.error(`❌ Blocked CORS request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));  

// 3. Rate limiting — prevent API abuse
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_LIMIT = 100;
const RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000;

const activeRateLimitLockouts = new Map();

function getRedisRateLimitKey(rateLimitKey) {
  return `${REDIS_KEY_PREFIX}${rateLimitKey}`;
}

function getResetAtMillis(resetTime) {
  if (resetTime instanceof Date) return resetTime.getTime();
  const value = Number(resetTime);
  return Number.isFinite(value) ? value : null;
}

function getSecondsUntil(resetAt) {
  return Number.isFinite(resetAt)
    ? Math.max(0, Math.ceil((resetAt - Date.now()) / 1000))
    : 0;
}

async function clearPersistedRateLimitLockout(rateLimitKey) {
  if (!redis) return;

  try {
    await redis.del(getRedisRateLimitKey(rateLimitKey));
  } catch (error) {
    console.warn('⚠️ Redis lockout delete failed:', error.message);
  }
}

async function persistActiveRateLimitLockout(rateLimitKey, resetAt) {
  if (!redis || !Number.isFinite(resetAt)) return;

  const ttlSeconds = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));
  if (ttlSeconds <= 0) {
    await clearPersistedRateLimitLockout(rateLimitKey);
    return;
  }

  try {
    await redis.set(
      getRedisRateLimitKey(rateLimitKey),
      { resetAt },
      { exat: Math.ceil(resetAt / 1000) }
    );
  } catch (error) {
    console.warn('⚠️ Redis lockout write failed:', error.message);
  }
}

async function readPersistedRateLimitLockout(rateLimitKey) {
  if (!redis) return null;

  try {
    const stored = await redis.get(getRedisRateLimitKey(rateLimitKey));
    const resetAt = Number(stored?.resetAt ?? stored?.lockoutResetAt ?? stored);

    if (!Number.isFinite(resetAt) || resetAt <= Date.now()) {
      await clearPersistedRateLimitLockout(rateLimitKey);
      return null;
    }

    return { resetAt };
  } catch (error) {
    console.warn('⚠️ Redis lockout read failed:', error.message);
    return null;
  }
}

function purgeExpiredRateLimitLockout(rateLimitKey) {
  const entry = activeRateLimitLockouts.get(rateLimitKey);
  if (!entry) return null;

  if (entry.resetAt > Date.now()) return entry;

  if (entry.timer) clearTimeout(entry.timer);
  activeRateLimitLockouts.delete(rateLimitKey);
  void clearPersistedRateLimitLockout(rateLimitKey);
  return null;
}

function getActiveRateLimitLockout(rateLimitKey) {
  return purgeExpiredRateLimitLockout(rateLimitKey);
}

async function hydrateActiveRateLimitLockout(rateLimitKey) {
  const cached = purgeExpiredRateLimitLockout(rateLimitKey);
  if (cached) return cached;

  const stored = await readPersistedRateLimitLockout(rateLimitKey);
  if (!stored) return null;

  return setActiveRateLimitLockout(rateLimitKey, stored.resetAt);
}

function setActiveRateLimitLockout(rateLimitKey, resetAt = Date.now() + RATE_LIMIT_LOCKOUT_MS) {
  const existing = purgeExpiredRateLimitLockout(rateLimitKey);
  const nextResetAt = existing ? Math.max(existing.resetAt, resetAt) : resetAt;

  if (existing?.timer) {
    clearTimeout(existing.timer);
  }

  const delayMs = Math.max(0, nextResetAt - Date.now());
  const timer = setTimeout(() => {
    const current = activeRateLimitLockouts.get(rateLimitKey);
    if (current && current.resetAt <= Date.now()) {
      activeRateLimitLockouts.delete(rateLimitKey);
      void clearPersistedRateLimitLockout(rateLimitKey);
    }
  }, delayMs);

  timer.unref?.();

  const entry = { resetAt: nextResetAt, timer };
  activeRateLimitLockouts.set(rateLimitKey, entry);
  void persistActiveRateLimitLockout(rateLimitKey, nextResetAt);
  return entry;
}

function buildRateLimitPayload({ rateLimited, remaining, retryAfterSeconds, resetAt, requestWindowResetAt, lockoutResetAt }) {
  return {
    rateLimited,
    remaining,
    retryAfterSeconds,
    resetAt,
    requestWindowResetAt: requestWindowResetAt ?? null,
    lockoutResetAt: lockoutResetAt ?? null,
    timeRemaining: `${Math.floor(retryAfterSeconds / 60)}m ${retryAfterSeconds % 60}s`,
  };
}

function getRequestWindowSnapshot(rateLimitInfo) {
  const totalHits = Number(rateLimitInfo?.totalHits ?? 0);
  const requestWindowResetAt = getResetAtMillis(rateLimitInfo?.resetTime);

  if (!Number.isFinite(requestWindowResetAt) || requestWindowResetAt <= Date.now()) {
    return {
      totalHits,
      remaining: RATE_LIMIT_LIMIT,
      requestWindowResetAt: null,
      retryAfterSeconds: 0,
      expired: true,
    };
  }

  return {
    totalHits,
    remaining: Math.max(0, RATE_LIMIT_LIMIT - totalHits),
    requestWindowResetAt,
    retryAfterSeconds: getSecondsUntil(requestWindowResetAt),
    expired: false,
  };
}

// Parses/validates the `cost` query param on /api/rate-limit-status — the
// number of backend requests the caller is about to make (a full Trace
// search, a live-update cycle, etc.). Returns null for anything malformed,
// which simply disables the pre-flight check rather than causing a wrong denial.
function parseOperationCost(rawValue) {
  if (rawValue == null) return null;
  const value = Number(rawValue);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) return null;
  return value;
}



// Shared key helper so the limiter and the status endpoint read the same user bucket.
function getRateLimitKey(req) {
  const key = req.ip;
  const activeLockout = getActiveRateLimitLockout(key);

  if (process.env.DEBUG_TRUST_PROXY === 'true') {
    console.log('🔎 Rate-limit key debug:', {
      key,
      reqIp: req.ip,
      reqIps: req.ips,
      remoteAddress: req.socket.remoteAddress,
      xForwardedFor: req.get('x-forwarded-for') || null,
      xRealIp: req.get('x-real-ip') || null,
      trustProxy: req.app.get('trust proxy'),
      activeLockoutResetAt: activeLockout?.resetAt ?? null,
      activeLockoutRemainingSeconds: activeLockout
        ? getSecondsUntil(activeLockout.resetAt)
        : 0,
      serverTime: Date.now(),
      serverTimeIso: new Date().toISOString(),
    });
  }

  return key;
}

// ── Redis-backed rate-limit store ──
// MemoryStore keeps hit counts in local process memory, which works on a
// single persistent process (Codespaces dev) but is NOT shared across
// Vercel's serverless function instances — each instance gets its own
// empty counter, so the 100/15min limit is never coherently enforced in
// production. This backs the counter with the same Upstash Redis instance
// already used for lockout persistence.

// Runs INCR, the first-hit EXPIRE, and the TTL read as a single atomic
// Redis-side Lua script (via EVAL) instead of 2-3 separate round trips.
// Without this, INCR and EXPIRE are each atomic individually, but the
// *sequence* isn't: a concurrent request landing between this key's
// first INCR and its EXPIRE would read TTL as unset (-1) and re-issue
// its own EXPIRE relative to its own clock, nudging the window's reset
// time later than exactly windowMs after the true first hit. The total
// count itself was never at risk (INCR alone is atomic), only the
// window boundary's precision under concurrent load.
const RATE_LIMIT_INCREMENT_SCRIPT = `
  local totalHits = redis.call('INCR', KEYS[1])
  if totalHits == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  local ttl = redis.call('TTL', KEYS[1])
  return {totalHits, ttl}
`;

class RedisRateLimitStore {
  constructor(redisClient, prefix) {
    this.redis = redisClient;
    this.prefix = prefix;
    this.windowMs = RATE_LIMIT_WINDOW_MS;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  _key(key) {
    return `${this.prefix}${key}`;
  }

  async increment(key) {
    const redisKey = this._key(key);
    const windowSeconds = Math.ceil(this.windowMs / 1000);

    try {
      const [totalHits, ttl] = await this.redis.eval(
        RATE_LIMIT_INCREMENT_SCRIPT,
        [redisKey],
        [windowSeconds]
      );

      const ttlSeconds = Number.isFinite(ttl) && ttl > 0 ? ttl : windowSeconds;

      return { totalHits, resetTime: new Date(Date.now() + ttlSeconds * 1000) };
    } catch (error) {
      console.warn('⚠️ Redis rate-limit increment failed:', error.message);
      throw error;
    }
  }

  async decrement(key) {
    try {
      await this.redis.decr(this._key(key));
    } catch {
      // Key may not exist yet — nothing to decrement.
    }
  }

  async resetKey(key) {
    try {
      await this.redis.del(this._key(key));
    } catch (error) {
      console.warn('⚠️ Redis rate-limit resetKey failed:', error.message);
      throw error;
    }
  }

  async get(key) {
    const redisKey = this._key(key);

    try {
      const [value, ttlSeconds] = await Promise.all([
        this.redis.get(redisKey),
        this.redis.ttl(redisKey),
      ]);

      if (value === null || value === undefined) return undefined;

      return {
        totalHits: Number(value),
        resetTime:
          Number.isFinite(ttlSeconds) && ttlSeconds > 0
            ? new Date(Date.now() + ttlSeconds * 1000)
            : undefined,
      };
    } catch (error) {
      console.warn('⚠️ Redis rate-limit get failed:', error.message);
      throw error;
    }
  }
}

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  // Fail OPEN if Redis has a transient error. Without this, express-rate-limit
  // defaults to failing CLOSED — and since RedisRateLimitStore.increment()
  // now rejects on any Redis error, an unhandled Redis blip would 500 every
  // request across all of /api (apiLimiter is mounted globally below).
  // Requires express-rate-limit >=7.4.0 (the exact behavior was fixed in
  // 7.4.1, which is what package.json pins).
  passOnStoreError: true,
  ...(redis
    ? { store: new RedisRateLimitStore(redis, `${REDIS_KEY_PREFIX}hits:`) }
    : {}),
  handler: (req, res, next, options) => {
    const rateLimitKey = getRateLimitKey(req);
    const requestWindowResetAt = getResetAtMillis(req.rateLimit?.resetTime);
    const lockout = setActiveRateLimitLockout(rateLimitKey);
    const retryAfterSeconds = getSecondsUntil(lockout.resetAt);

    res.setHeader('Retry-After', String(retryAfterSeconds));

    return res.status(options.statusCode || 429).json({
      error: 'Too many requests. Please try again later.',
      ...buildRateLimitPayload({
        rateLimited: true,
        remaining: 0,
        retryAfterSeconds,
        resetAt: lockout.resetAt,
        requestWindowResetAt,
        lockoutResetAt: lockout.resetAt,
      }),
    });
  },
});

// ── Rate-limit status endpoint ──
// Registered BEFORE app.use('/api', apiLimiter) below, so requests to this
// path never pass through the limiter middleware — it can't be blocked,
// and it doesn't consume a hit against the same budget.
app.get('/api/rate-limit-status', async (req, res) => {
  try {
    const rateLimitKey = getRateLimitKey(req);
    const activeLockout = await hydrateActiveRateLimitLockout(rateLimitKey);

    if (activeLockout) {
      const retryAfterSeconds = getSecondsUntil(activeLockout.resetAt);

      return res.json({
        error: null,
        rateLimited: true,
        remaining: 0,
        retryAfterSeconds,
        resetAt: activeLockout.resetAt,
        lockoutResetAt: activeLockout.resetAt,
        requestWindowResetAt: null,
        serverTime: Date.now(),
      });
    }

    const operationCost = parseOperationCost(req.query.cost);
    const info = await apiLimiter.getKey(rateLimitKey);

    if (!info) {
      return res.json({
        error: null,
        rateLimited: false,
        remaining: RATE_LIMIT_LIMIT,
        retryAfterSeconds: 0,
        resetAt: null,
        lockoutResetAt: null,
        requestWindowResetAt: null,
        serverTime: Date.now(),
      });
    }

    const windowSnapshot = getRequestWindowSnapshot(info);

    if (windowSnapshot.expired) {
      return res.json({
        error: null,
        rateLimited: false,
        remaining: RATE_LIMIT_LIMIT,
        retryAfterSeconds: 0,
        resetAt: null,
        lockoutResetAt: null,
        requestWindowResetAt: null,
        serverTime: Date.now(),
      });
    }

    // Backend is the sole authority for the 15-minute lockout. If the caller
    // told us the cost of the operation it's about to run and the remaining
    // budget in the current request window can't cover it, establish the
    // lockout now — the frontend must never invent this timestamp itself.
    if (operationCost !== null && windowSnapshot.remaining < operationCost) {
      const lockout = setActiveRateLimitLockout(rateLimitKey);
      const retryAfterSeconds = getSecondsUntil(lockout.resetAt);

      return res.json({
        error: null,
        rateLimited: true,
        remaining: windowSnapshot.remaining,
        retryAfterSeconds,
        resetAt: lockout.resetAt,
        lockoutResetAt: lockout.resetAt,
        requestWindowResetAt: windowSnapshot.requestWindowResetAt,
        serverTime: Date.now(),
      });
    }

    return res.json({
      error: null,
      rateLimited: false,
      remaining: windowSnapshot.remaining,
      retryAfterSeconds: windowSnapshot.retryAfterSeconds,
      resetAt: windowSnapshot.requestWindowResetAt,
      lockoutResetAt: null,
      requestWindowResetAt: windowSnapshot.requestWindowResetAt,
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error('Rate-limit status error:', error.message);
    return res.json({
      error: 'Unable to verify rate limit right now.',
      rateLimited: false,
      remaining: null,
      retryAfterSeconds: 0,
      resetAt: null,
      lockoutResetAt: null,
      requestWindowResetAt: null,
      serverTime: Date.now(),
    });
  }
});

app.use('/api', async (req, res, next) => {
  if (req.path === '/rate-limit-status') {
    return next();
  }

  const rateLimitKey = getRateLimitKey(req);
  const activeLockout = await hydrateActiveRateLimitLockout(rateLimitKey);

  if (!activeLockout) {
    return next();
  }

  const retryAfterSeconds = getSecondsUntil(activeLockout.resetAt);
  res.setHeader('Retry-After', String(retryAfterSeconds));

  return res.status(429).json({
    error: 'Too many requests. Please try again later.',
    ...buildRateLimitPayload({
      rateLimited: true,
      remaining: 0,
      retryAfterSeconds,
      resetAt: activeLockout.resetAt,
      lockoutResetAt: activeLockout.resetAt,
      requestWindowResetAt: null,
    }),
  });
});

// Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// 4. JSON body parser
app.use(express.json());

// ── API Keys — loaded from .env — never sent to browser ──
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_BARCHART_TRANSACTION_API_KEY =
  process.env.HELIUS_BARCHART_TRANSACTION_API_KEY?.trim() || '';
const JUPITER_API_KEY = process.env.JUPITER_API_KEY;
const SHYFT_API_KEY = process.env.SHYFT_API_KEY;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const CMC_API_KEY = process.env.CMC_API_KEY;

// ── Helper — validate Solana address format ──
// Solana addresses are Base58 encoded and 32-44 characters long
function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address.trim());
}

// ── Helper — handle fetch errors gracefully ──
// Carries the real upstream HTTP status so callers can tell "the provider is
// down/overloaded" apart from "our own code threw" — never inferred from a
// message string.
class UpstreamError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
  }
}

async function safeFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new UpstreamError(`API error: ${response.status} ${response.statusText}`, response.status);
  }
  return response.json();
}

// Genuine "upstream/network delay" signals only — a 502/503/504 from the
// provider itself, or a transport-level failure (timeout, reset, refused,
// DNS). Anything else (4xx from the provider, a JS exception in our own
// code, a malformed response) is NOT a delay — it stays 'server'.
const DELAY_LIKE_HTTP_STATUSES = new Set([502, 503, 504]);
const DELAY_LIKE_NETWORK_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN']);

function isSolanaDelayError(error) {
  if (error instanceof UpstreamError) {
    return DELAY_LIKE_HTTP_STATUSES.has(error.status);
  }
  const code = error?.code || error?.cause?.code;
  return Boolean(code && DELAY_LIKE_NETWORK_CODES.has(code));
}

// Shared responder for every route below — the ONLY place errorType gets
// decided, so every card gets the same, evidence-based classification.
function sendUpstreamFailure(res, error, fallbackMessage) {
  const errorType = isSolanaDelayError(error) ? 'solana-delay' : 'server';
  const payload = { error: fallbackMessage, errorType };
  if (errorType === 'solana-delay') {
    payload.headline = 'Solana network is experiencing delays. Please try again shortly.';
  }
  return res.status(503).json(payload);
}

// ── Feedback configuration / validation helpers ──
const FEEDBACK_TIMING_THRESHOLD_MS = 2500;
const FEEDBACK_DATE_LOCALE = 'en-CA';

const FEEDBACK_BLOCKLIST = [
  'casino',
  'online casino',
  'sportsbook',
  'sports betting',
  'betting bonus',
  'casino bonus',
  'poker bonus',
  'blackjack bonus',

  'porn',
  'xxx',
  'sex cam',
  'webcam girl',
  'escort service',
  'adult dating',

  'guaranteed returns',
  'guaranteed profit',
  'double your bitcoin',
  'double your crypto',
  'send 1 get 2',
  'investment opportunity',
  'limited time investment',
  'crypto giveaway',
  'token giveaway',
  'airdrop claim',
  'free crypto',
  'instant withdrawal',
  'passive income opportunity',

  'seo services',
  'buy backlinks',
  'link building',
  'guest post',
  'sponsored post',
  'rank your website',
  'digital marketing agency',
  'web design agency',
  'social media marketing service',

  'viagra',
  'cialis',
  'levitra',
  'buy pills',
  'cheap pharmacy',
];

function normalizeFeedbackText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function feedbackPhraseMatches(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
  return pattern.test(text);
}

function feedbackContainsBlockedContent(text) {
  if (/https?:\/\/|www\./i.test(text)) return true;

  return FEEDBACK_BLOCKLIST.some((phrase) =>
    feedbackPhraseMatches(text, phrase)
  );
}

function getFeedbackCounterKey() {
  return `${FEEDBACK_REDIS_KEY_PREFIX}sequence`;
}

function getFeedbackDateLabel() {
  return new Date().toLocaleDateString(FEEDBACK_DATE_LOCALE);
}

function classifyFeedbackProviderFailure(error) {
  if (!error) return 'unknown';

  if (error instanceof UpstreamError) {
    if (error.status === 402) return 'quota';
    if (error.status === 429) return 'rate-limit';
    if (error.status >= 500) return 'provider-5xx';

    if (
      error.status === 400 ||
      error.status === 401 ||
      error.status === 403
    ) {
      return `provider-${error.status}`;
    }

    return `provider-${error.status}`;
  }

  return 'network-or-runtime';
}

async function sendFeedbackWithBrevo(feedback, subject) {
  if (
    !BREVO_API_KEY ||
    !FEEDBACK_RECIPIENT_EMAIL ||
    !BREVO_SENDER_EMAIL
  ) {
    throw new Error('Brevo feedback configuration is incomplete.');
  }

  const response = await fetch(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: BREVO_SENDER_EMAIL,
          name: FEEDBACK_SENDER_NAME,
        },
        to: [
          {
            email: FEEDBACK_RECIPIENT_EMAIL,
          },
        ],
        subject,
        textContent: feedback,
      }),
    }
  );

  if (!response.ok) {
    throw new UpstreamError(
      `Brevo API error: ${response.status}`,
      response.status
    );
  }

  return response.json().catch(() => ({}));
}

async function sendFeedbackWithResend(feedback, subject) {
  if (
    !RESEND_API_KEY ||
    !FEEDBACK_RECIPIENT_EMAIL ||
    !RESEND_SENDER_EMAIL
  ) {
    throw new Error('Resend feedback configuration is incomplete.');
  }

  const response = await fetch(
    'https://api.resend.com/emails',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: FEEDBACK_SENDER_NAME
          ? `${FEEDBACK_SENDER_NAME} <${RESEND_SENDER_EMAIL}>`
          : RESEND_SENDER_EMAIL,
        to: [FEEDBACK_RECIPIENT_EMAIL],
        subject,
        text: feedback,
      }),
    }
  );

  if (!response.ok) {
    throw new UpstreamError(
      `Resend API error: ${response.status}`,
      response.status
    );
  }

  return response.json().catch(() => ({}));
}

async function deliverFeedback(feedback, subject, correlationId) {
  let brevoFailure = null;

  try {
    await sendFeedbackWithBrevo(feedback, subject);

    return {
      delivered: true,
      provider: 'brevo',
    };
  } catch (error) {
    brevoFailure = error;

    console.warn('Feedback Brevo delivery failed:', {
      correlationId,
      category: classifyFeedbackProviderFailure(error),
    });
  }

  const brevoCategory = classifyFeedbackProviderFailure(brevoFailure);

  const shouldFallback =
    !brevoFailure ||
    brevoCategory === 'quota' ||
    brevoCategory === 'rate-limit' ||
    brevoCategory === 'provider-5xx' ||
    brevoCategory === 'network-or-runtime';

  if (!shouldFallback) {
    return {
      delivered: false,
      bothProvidersFailed: false,
      configurationOrValidationFailure: true,
    };
  }

  try {
    await sendFeedbackWithResend(feedback, subject);

    return {
      delivered: true,
      provider: 'resend',
    };
  } catch (resendError) {
    console.error(
      'CRITICAL: feedback delivery failed through both providers.',
      {
        correlationId,
        brevo: classifyFeedbackProviderFailure(brevoFailure),
        resend: classifyFeedbackProviderFailure(resendError),
      }
    );

    return {
      delivered: false,
      bothProvidersFailed: true,
      brevoCategory,
      resendCategory: classifyFeedbackProviderFailure(resendError),
    };
  }
}

// ════════════════════════════════════════
// ── API ROUTES ──
// ════════════════════════════════════════

// ── Route 1 — GET /api/sol-price ──
// Fetches live SOL price and 24h percentage change from CoinGecko
// CoinGecko free tier does not require API key
app.get('/api/sol-price', async (req, res) => {
  // Tier 1 — CoinGecko Demo
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true';
    const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
    const data = await safeFetch(url, { headers });
    if (!data.solana) {
  throw new Error('Unexpected CoinGecko response');
    }
    return res.json({ price: data.solana.usd, change24h: data.solana.usd_24h_change, source: 'coingecko' });
  } catch (error) {
    console.warn('CoinGecko SOL price failed, trying CoinMarketCap:', error.message);
  }

  // Tier 2 — CoinMarketCap fallback
  try {
    if (!CMC_API_KEY) throw new Error('CMC key not configured');
    const data = await safeFetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SOL',
      { headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY } }
    );
    const quote = data.data?.SOL?.quote?.USD;
    if (!quote) throw new Error('Unexpected CMC response shape');
    return res.json({ price: quote.price, change24h: quote.percent_change_24h, source: 'coinmarketcap' });
  } catch (error) {
    console.error('CoinMarketCap SOL price also failed:', error.message);
    return sendUpstreamFailure(res, error, 'Unable to fetch SOL price. Please try again shortly.');
  }
});

// ── Route 2 — GET /api/sol-balance?address= ──
// Fetches SOL balance for a wallet address from Solana RPC
app.get('/api/sol-balance', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  try {
    const url = HELIUS_API_KEY
      ? `https://beta.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
      : 'https://api.mainnet-beta.solana.com';

    const data = await safeFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address.trim()],
      }),
    });

    // Convert lamports to SOL — 1 SOL = 1,000,000,000 lamports
    const lamports = data.result?.value ?? 0;
    const sol = lamports / 1_000_000_000;

    res.json({ balance: sol });
  } catch (error) {
    console.error('SOL balance error:', error.message);

    let finalError = error;

    // Fallback — Shyft wallet balance API, only tried if Helius/public RPC failed
    if (SHYFT_API_KEY) {
      try {
        const shyftData = await safeFetch(
          `https://api.shyft.to/sol/v1/wallet/balance?network=mainnet-beta&wallet=${address.trim()}`,
          {
            headers: { 'x-api-key': SHYFT_API_KEY },
          }
        );
        return res.json({ balance: shyftData.result?.balance ?? 0 });
      } catch (shyftError) {
        console.error('Shyft balance fallback error:', shyftError.message);
        finalError = shyftError;
      }
    }

    return sendUpstreamFailure(res, finalError, 'Unable to fetch SOL balance. Solana network may be experiencing delays.');
  }
});

// Decimal-safe: BigInt division, converted to Number only after scaling to human range
function rawAmountToDecimal(rawAmountStr, decimals) {
  const raw = BigInt(rawAmountStr);
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;
  const absFraction = fraction < 0n ? -fraction : fraction;
  const fractionStr = absFraction.toString().padStart(decimals, '0');
  return decimals > 0 ? `${whole}.${fractionStr}` : `${whole}`; // returns a String, never a Number
}

function parseTokenAccountAmount(rawAmount) {
  if (typeof rawAmount === 'bigint') return rawAmount;

  if (typeof rawAmount === 'number') {
    if (!Number.isFinite(rawAmount) || !Number.isInteger(rawAmount)) return null;
    return BigInt(rawAmount);
  }

  if (typeof rawAmount === 'string') {
    const trimmed = rawAmount.trim();
    if (!/^-?\d+$/.test(trimmed)) return null;
    return BigInt(trimmed);
  }

  return null;
}

function aggregateTokenAccountsByMint(accounts = []) {
  const grouped = new Map();

  for (const account of accounts) {
    const mint = account?.mint;
    if (!mint) continue;

    const amount = parseTokenAccountAmount(account.amount);
    if (amount == null || amount <= 0n) continue;

    const existing = grouped.get(mint);
    if (existing) {
      existing.amount += amount;
      continue;
    }

    grouped.set(mint, {
      ...account,
      amount,
    });
  }

  return [...grouped.values()];
}

// Stage 1 — Helius DAS getAssetBatch (metadata requires showFungibleTokens)
async function resolveTokenMetadata(mints) {
  const metadataMap = new Map();
  if (mints.length === 0) return metadataMap;

  const normalizedMints = [...new Set(
    mints.map((mint) => String(mint || '').trim()).filter(Boolean)
  )];

  const missingMints = [];

  for (const mint of normalizedMints) {
    const cachedMetadata = getBoundedTtlCacheValue(tokenMetadataCache, mint);
    const cachedLogo = getBoundedTtlCacheValue(tokenLogoCache, mint);

    if (cachedMetadata || cachedLogo) {
      metadataMap.set(mint, {
        ...(cachedMetadata || {
          symbol: null,
          name: null,
          decimals: 0,
          interface: null,
        }),
        logoURI: cachedLogo ?? null,
      });
    }

    if (!cachedMetadata || !cachedLogo) {
      missingMints.push(mint);
    }
  }

  if (missingMints.length === 0) return metadataMap;

  const CHUNK_SIZE = 1000;
  const chunks = [];

  for (let i = 0; i < missingMints.length; i += CHUNK_SIZE) {
    chunks.push(missingMints.slice(i, i + CHUNK_SIZE));
  }

  await Promise.allSettled(
    chunks.map(async (chunk) => {
      try {
        const data = await safeFetch(
          `https://beta.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getAssetBatch',
              params: {
                ids: chunk,
                displayOptions: { showFungible: true },
              },
            }),
          }
        );

        const assets = Array.isArray(data.result) ? data.result : [];

        for (const asset of assets) {
          if (!asset?.id) continue;

          const meta = asset.content?.metadata || {};
          const image =
            asset.content?.links?.image ||
            asset.content?.files?.[0]?.uri ||
            null;

          const tokenInfo = asset.token_info || {};

          const metadata = {
            symbol: meta.symbol || tokenInfo.symbol || null,
            name: meta.name || null,
            decimals:
              typeof tokenInfo.decimals === 'number'
                ? tokenInfo.decimals
                : 0,
            interface: asset.interface || null,
          };

          setBoundedTtlCacheValue(
            tokenMetadataCache,
            asset.id,
            metadata,
            TOKEN_METADATA_CACHE_TTL_MS
          );

          if (image) {
            setBoundedTtlCacheValue(
              tokenLogoCache,
              asset.id,
              image,
              TOKEN_LOGO_CACHE_TTL_MS
            );
          }

          metadataMap.set(asset.id, {
            ...metadata,
            logoURI: image || null,
          });
        }
      } catch (err) {
        console.error('Helius metadata batch error:', err.message);
      }
    })
  );

  return metadataMap;
}

// Stage 2 — Jupiter Price V3 fallback (max 50 ids per request, confirmed via official docs)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveJupiterPrices(mints) {
  const priceMap = new Map();
  if (mints.length === 0) return priceMap;

  const hasKey = !!JUPITER_API_KEY;
  const baseUrl = hasKey ? 'https://api.jup.ag/price/v3' : 'https://lite-api.jup.ag/price/v3';
  const CHUNK_SIZE = 50; // Jupiter's documented per-request limit, both modes
  const CHUNK_DELAY_MS = hasKey ? 1000 : 2000; // 1 RPS keyed / 0.5 RPS keyless — confirmed via dev.jup.ag/docs/portal/plans

  console.log(`[Jupiter] Running in ${hasKey ? 'KEYED (1 req/sec)' : 'KEYLESS (0.5 req/sec)'} mode`);

  const chunks = [];
  for (let i = 0; i < mints.length; i += CHUNK_SIZE) {
    chunks.push(mints.slice(i, i + CHUNK_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const options = hasKey ? { headers: { 'x-api-key': JUPITER_API_KEY } } : {};
      const data = await safeFetch(`${baseUrl}?ids=${chunk.join(',')}`, options);
      for (const mint of chunk) {
        if (data[mint] && typeof data[mint].usdPrice === 'number') {
          priceMap.set(mint, { priceUsd: data[mint].usdPrice, priceSource: 'jupiter' });
        }
      }
    } catch (err) {
      console.error('Jupiter price batch error:', err.message);
    }

    if (i < chunks.length - 1) {
      await sleep(CHUNK_DELAY_MS);
    }
  }

  return priceMap;
}

// Stage 3 — Raydium V3 fallback (free, unauthenticated, fair-use — last resort only)
async function resolveRaydiumPrices(mints) {
  const priceMap = new Map();
  if (mints.length === 0) return priceMap;

  const CHUNK_SIZE = 100; // keeps each query string well under URL length limits
  const chunks = [];
  for (let i = 0; i < mints.length; i += CHUNK_SIZE) {
    chunks.push(mints.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    try {
      const data = await safeFetch(
        `https://api-v3.raydium.io/mint/price?mints=${chunk.join(',')}`
      );
      const prices = data?.data || {};
      for (const mint of chunk) {
        if (prices[mint]) {
          priceMap.set(mint, { priceUsd: parseFloat(prices[mint]), priceSource: 'raydium' });
        }
      }
    } catch (err) {
      console.error('Raydium price batch error:', err.message);
      // One bad chunk no longer wipes out pricing for every other mint
    }
  }

  return priceMap;
}



// Lightweight live-price-only endpoint — Jupiter only, no Raydium, no metadata re-fetch.
// Used for the 60-second refresh cycle so we don't repeatedly hit Raydium's
// fallback-only, non-real-time API on every tick (per Raydium's own docs).
app.post('/api/token-prices-live', async (req, res) => {
  const { mints } = req.body;

  if (!Array.isArray(mints) || mints.length === 0) {
    return res.status(400).json({ error: 'Mint addresses are required.' });
  }

  try {
    const mintList = [...new Set(mints.filter(Boolean))];
    const jupiterPrices = await resolveJupiterPrices(mintList);

    // Raydium /mint/price confirmed sanctioned for UI rendering at this cadence
    // (docs.raydium.io/sdk-api/rest-api: "fine for UI rendering; never loop it in a bot")
    const missingAfterJupiter = mintList.filter((mint) => !jupiterPrices.has(mint));
    const raydiumPrices = await resolveRaydiumPrices(missingAfterJupiter);

    const prices = {};
    const unpriced = [];
    for (const mint of mintList) {
      const price = jupiterPrices.get(mint)?.priceUsd ?? raydiumPrices.get(mint)?.priceUsd ?? null;
      if (price !== null) {
        prices[mint] = price;
      } else {
        unpriced.push(mint);
      }
    }

    res.json({ prices, unpriced });
  } catch (error) {
    console.error('Live price error:', error.message);
    res.status(503).json({ error: 'Unable to fetch live prices.' });
  }
});

// Lightweight metadata-only lookup — used to resolve real names for
// SPL tokens appearing in transaction descriptions (not pricing-related)
app.get('/api/token-metadata', async (req, res) => {
  const { mints } = req.query;
  if (!mints) return res.status(400).json({ error: 'Mint addresses are required.' });
  try {
    const mintList = mints.split(',').filter(Boolean);
    const metadataMap = await resolveTokenMetadata(mintList);
    const metadata = {};
    for (const [mint, meta] of metadataMap.entries()) {
      metadata[mint] = { symbol: meta.symbol, name: meta.name };
    }
    res.json({ metadata });
  } catch (error) {
    console.error('Token metadata error:', error.message);
    res.status(503).json({ error: 'Unable to resolve token metadata.' });
  }
});

// ── Route 3 — GET /api/tokens?address= ──
// Fetches SPL token holdings from Helius or Shyft

app.get('/api/tokens', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  try {
    let mappedTokens;

    if (HELIUS_API_KEY) {
      // Step 1 — get raw token accounts (mint, amount, owner only)
      const data = await safeFetch(
        `https://beta.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccounts',
            params: { owner: address.trim() },
          }),
        }
      );

      const accounts = (data.result?.token_accounts || []).filter(
        (t) => t.amount > 0
      );

      // Step 2 — resolve metadata for all mints in one batch call

      const preFilter = accounts.filter((t) => BigInt(t.amount) > 0n);
const preMints = [...new Set(preFilter.map((t) => t.mint).filter(Boolean))];

// Stage 1 — Helius: metadata ONLY (name, symbol, logo, decimals, interface) — no pricing
const metadataMap = await resolveTokenMetadata(preMints);

// getTokenAccounts returns NFTs too — on Solana an NFT is just a token account
// with supply 1 / decimals 0, no on-chain distinction at that layer. Filter them
// out here using the `interface` field Helius resolves for each mint.
const NFT_INTERFACES = new Set([
  'V1_NFT',
  'V2_NFT',
  'V1_PRINT',
  'LEGACY_NFT',
  'ProgrammableNFT',
  'MplCoreAsset',
  'MplCoreCollection',
]);

const filtered = preFilter.filter((t) => {
  const iface = metadataMap.get(t.mint)?.interface;
  return !iface || !NFT_INTERFACES.has(iface);
});

// Aggregate duplicate token accounts by mint before pricing.
// This is the key fix for duplicate USDC / same-mint rows in the token list and pie chart.
const aggregated = aggregateTokenAccountsByMint(filtered);
const mints = aggregated.map((t) => t.mint);

// Stage 2 — Jupiter: primary live pricing for EVERY mint
const jupiterPrices = await resolveJupiterPrices(mints);

// Stage 3 — Raydium: fallback only for mints Jupiter omitted
const missingAfterJupiter = mints.filter((mint) => !jupiterPrices.has(mint));
const raydiumPrices = await resolveRaydiumPrices(missingAfterJupiter);

mappedTokens = aggregated
  .map((t) => {
    const meta = metadataMap.get(t.mint);
    const decimals = meta?.decimals ?? 0;
    const price =
      jupiterPrices.get(t.mint)?.priceUsd ??
      raydiumPrices.get(t.mint)?.priceUsd ??
      null;
    const priceSource =
      jupiterPrices.get(t.mint)?.priceSource ||
      raydiumPrices.get(t.mint)?.priceSource ||
      null;

    return {
      mint: t.mint,
      amount: rawAmountToDecimal(t.amount.toString(), decimals), // aggregated raw amount
      symbol: meta?.symbol || (t.mint.slice(0, 4) + '...' + t.mint.slice(-4)),
      name: meta?.name || null,
      logoURI: meta?.logoURI || null,
      priceUsd: price,
      priceSource,
      // Explicitly checked all three tiers and found nothing — e.g. still on a
      // Pump.fun bonding curve. Distinct from "haven't checked yet" states elsewhere.
      priceUnavailable: price === null,
    };
  })
  .filter((t) => parseFloat(t.amount) > 0);

res.json({ tokens: mappedTokens });
    } else if (SHYFT_API_KEY) {
      // Backup — Shyft API
      const data = await safeFetch(
        `https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=${address.trim()}`,
        {
          headers: { 'x-api-key': SHYFT_API_KEY },
        }
      );

      res.json({
        tokens: data.result || [],
      });
    } else {
      return res.status(503).json({
        error: 'No API key configured. Please add HELIUS_API_KEY to .env',
      });
    }
  } catch (error) {
    console.error('Token error:', error.message);
    return sendUpstreamFailure(res, error, 'Unable to fetch token holdings. Please try again shortly.');
  }
});

// ── NFT pagination tuning — dedicated env vars, separate from the chart
// endpoint's Helius budget so each can be tuned independently later. ──
const HELIUS_MAX_NFT_PAGES = parsePositiveIntEnv(
  process.env.HELIUS_MAX_NFT_PAGES,
  50
);

const HELIUS_NFT_PAGE_DELAY_MS = parsePositiveIntEnv(
  process.env.HELIUS_NFT_PAGE_DELAY_MS,
  150
);

const HELIUS_NFT_MAX_PAGE_RETRIES = parsePositiveIntEnv(
  process.env.HELIUS_NFT_MAX_PAGE_RETRIES,
  3
);

const HELIUS_NFT_RETRY_BASE_DELAY_MS = parsePositiveIntEnv(
  process.env.HELIUS_NFT_RETRY_BASE_DELAY_MS,
  1000
);

const HELIUS_NFT_PAGE_SIZE = 1000;

// Single-page getAssetsByOwner call. Helius DAS pagination is 1-indexed.
async function fetchHeliusNftPage(ownerAddress, page) {
  return safeFetch(
    `https://beta.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page,
          limit: HELIUS_NFT_PAGE_SIZE,
        },
      }),
    }
  );
}

// Retries a single page on a 429 only, same policy as the chart endpoint.
async function fetchHeliusNftPageWithRetry(ownerAddress, page) {
  let attempt = 0;

  for (;;) {
    try {
      return await fetchHeliusNftPage(ownerAddress, page);
    } catch (error) {
      const isRateLimited =
        error instanceof UpstreamError && error.status === 429;

      if (!isRateLimited || attempt >= HELIUS_NFT_MAX_PAGE_RETRIES) {
        throw error;
      }

      attempt += 1;
      const backoffMs = HELIUS_NFT_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);

      console.warn(
        `Helius NFT page ${page} rate-limited — retrying in ${backoffMs}ms ` +
        `(attempt ${attempt}/${HELIUS_NFT_MAX_PAGE_RETRIES})`
      );

      await sleep(backoffMs);
    }
  }
}

// Pages through getAssetsByOwner until Helius returns a short page (fewer
// items than requested), meaning nothing is left. Paces requests with
// HELIUS_NFT_PAGE_DELAY_MS and retries individual pages on rate limits.
async function fetchAllHeliusNfts(ownerAddress) {
  const collected = [];

  for (let page = 1; page <= HELIUS_MAX_NFT_PAGES; page++) {
    if (page > 1) {
      await sleep(HELIUS_NFT_PAGE_DELAY_MS);
    }

    let data;
    try {
      data = await fetchHeliusNftPageWithRetry(ownerAddress, page);
    } catch (error) {
      if (page === 1) throw error;
      console.warn(`Helius NFT pagination stopped after ${page - 1} page(s) — ${error.message}`);
      break;
    }

    const items = data.result?.items || [];
    collected.push(...items);

    if (items.length < HELIUS_NFT_PAGE_SIZE) break;

    if (page === HELIUS_MAX_NFT_PAGES) {
      console.warn(
        `Helius NFT pagination hit the ${HELIUS_MAX_NFT_PAGES}-page cap for ${ownerAddress} — list may be incomplete.`
      );
    }
  }

  return collected;
}

// ── Route 4 — GET /api/nfts?address= ──
// Fetches NFT holdings from Helius or Shyft
app.get('/api/nfts', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  const normalizedAddress = address.trim();
  const providerPrefix = HELIUS_API_KEY
    ? 'helius'
    : SHYFT_API_KEY
      ? 'shyft'
      : 'none';

  const cacheKey = `${providerPrefix}:${normalizedAddress}`;
  const cached = getBoundedTtlCacheValue(nftDataCache, cacheKey);

  if (cached) {
    return res.json({
      nfts: cached,
      cached: true,
    });
  }

  try {
    let nfts;

    if (HELIUS_API_KEY) {
      nfts = await fetchAllHeliusNfts(normalizedAddress);
    } else if (SHYFT_API_KEY) {
      const data = await safeFetch(
        `https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address=${normalizedAddress}`,
        {
          headers: { 'x-api-key': SHYFT_API_KEY },
        }
      );

      nfts = data.result || [];
    } else {
      return res.status(503).json({
        error: 'No API key configured. Please add HELIUS_API_KEY to .env',
      });
    }

    rememberNftImageSources(nfts);

    const responseNfts = applyCachedNftImageSources(nfts);

    setBoundedTtlCacheValue(
      nftDataCache,
      cacheKey,
      responseNfts,
      NFT_DATA_CACHE_TTL_MS
    );

    return res.json({ nfts: responseNfts });
  } catch (error) {
    console.error('NFT error:', error.message);
    return sendUpstreamFailure(
      res,
      error,
      'Unable to fetch NFTs. Please try again shortly.'
    );
  }
});

// Batch 02 — bounded in-memory TTL caches. Redis persistence for these caches
// remains explicitly deferred post-MVP.
const SERVER_CACHE_MAX_ENTRIES = 1000;
const TOKEN_METADATA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TOKEN_LOGO_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const NFT_DATA_CACHE_TTL_MS = 15 * 60 * 1000;
const NFT_IMAGE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getBoundedTtlCacheValue(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function setBoundedTtlCacheValue(
  cache,
  key,
  value,
  ttlMs,
  maxEntries = SERVER_CACHE_MAX_ENTRIES
) {
  if (value === undefined || value === null) return;

  cache.delete(key);

  while (cache.size >= maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

const tokenMetadataCache = new Map();
const tokenLogoCache = new Map();
const nftDataCache = new Map();
const nftImageCache = new Map();

function rememberNftImageSources(nfts) {
  if (!Array.isArray(nfts)) return;

  for (const nft of nfts) {
    const assetId = nft?.id || nft?.assetId || nft?.asset_id;
    const image =
      nft?.content?.links?.image ||
      nft?.content?.files?.[0]?.uri ||
      nft?.image ||
      null;

    if (assetId && image) {
      setBoundedTtlCacheValue(
        nftImageCache,
        `asset:${assetId}`,
        image,
        NFT_IMAGE_CACHE_TTL_MS
      );
    }
  }
}

function applyCachedNftImageSources(nfts) {
  if (!Array.isArray(nfts)) return [];

  return nfts.map((nft) => {
    const assetId = nft?.id || nft?.assetId || nft?.asset_id;
    if (!assetId) return nft;

    const existingImage =
      nft?.content?.links?.image ||
      nft?.content?.files?.[0]?.uri ||
      nft?.image ||
      null;

    if (existingImage) return nft;

    const cachedImage = getBoundedTtlCacheValue(
      nftImageCache,
      `asset:${assetId}`
    );

    if (!cachedImage) return nft;

    return {
      ...nft,
      content: {
        ...(nft.content || {}),
        links: {
          ...(nft.content?.links || {}),
          image: cachedImage,
        },
      },
    };
  });
}

const HELIUS_MAX_TRANSACTION_PAGES = parsePositiveIntEnv(
  process.env.HELIUS_MAX_TX_PAGES,
  250
);

const HELIUS_TX_TIME_BUDGET_MS = parsePositiveIntEnv(
  process.env.HELIUS_TX_TIME_BUDGET_MS,
  60000
);

const HELIUS_CHART_PAGE_DELAY_MS = parsePositiveIntEnv(
  process.env.HELIUS_CHART_PAGE_DELAY_MS,
  150
);

const HELIUS_MAX_PAGE_RETRIES = parsePositiveIntEnv(
  process.env.HELIUS_MAX_PAGE_RETRIES,
  3
);

const HELIUS_RETRY_BASE_DELAY_MS = parsePositiveIntEnv(
  process.env.HELIUS_RETRY_BASE_DELAY_MS,
  1000
);

const HELIUS_CHART_CACHE_TTL_MS = parsePositiveIntEnv(
  process.env.HELIUS_CHART_CACHE_TTL_MS,
  90000
);

const HELIUS_CHART_CACHE_MAX_ENTRIES = parsePositiveIntEnv(
  process.env.HELIUS_CHART_CACHE_MAX_ENTRIES,
  200
);

const heliusChartResultCache = new Map();

function getCachedChartResult(cacheKey) {
  const entry = heliusChartResultCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    heliusChartResultCache.delete(cacheKey);
    return null;
  }

  heliusChartResultCache.delete(cacheKey);
  heliusChartResultCache.set(cacheKey, entry);

  return entry.data;
}

function setCachedChartResult(cacheKey, data) {
  heliusChartResultCache.delete(cacheKey);

  while (heliusChartResultCache.size >= HELIUS_CHART_CACHE_MAX_ENTRIES) {
    const oldestKey = heliusChartResultCache.keys().next().value;
    if (oldestKey === undefined) break;
    heliusChartResultCache.delete(oldestKey);
  }

  heliusChartResultCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + HELIUS_CHART_CACHE_TTL_MS,
  });
}

const HELIUS_CHART_API_KEY = HELIUS_BARCHART_TRANSACTION_API_KEY || (
  NODE_ENV === 'development' ? HELIUS_API_KEY : ''
);

if (!HELIUS_BARCHART_TRANSACTION_API_KEY) {
  if (NODE_ENV === 'development' && HELIUS_API_KEY) {
    console.warn(
      '⚠️ Dedicated Helius chart key is not configured; development is explicitly falling back to HELIUS_API_KEY for chart pagination.'
    );
  } else {
    console.warn(
      '⚠️ Dedicated Helius chart key is not configured; wallet-activity chart pagination is disabled outside development until HELIUS_BARCHART_TRANSACTION_API_KEY is provided.'
    );
  }
}

// ── Transaction history helpers ──
const MAX_TRANSACTION_HISTORY_YEARS = 5;

const HELIUS_CHART_PAGE_SIZE = 1000;
const HELIUS_RECENT_LIMIT = 7;

function parsePositiveIntEnv(rawValue, fallback) {
  const value = Number(rawValue);
  return Number.isFinite(value) && Number.isInteger(value) && value > 0 ? value : fallback;
}

function toUnixSeconds(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getTransactionTimestamp(tx) {
  return toUnixSeconds(tx?.timestamp ?? tx?.blockTime ?? null);
}

function getTransactionSignature(tx) {
  return tx?.signature || tx?.signatures?.[0] || null;
}

function getHistoryCutoffTimestamp(years = MAX_TRANSACTION_HISTORY_YEARS) {
  const parsedYears = Number(years);
  const clampedYears = Math.max(
    1,
    Math.min(
      Number.isFinite(parsedYears) ? Math.floor(parsedYears) : MAX_TRANSACTION_HISTORY_YEARS,
      MAX_TRANSACTION_HISTORY_YEARS
    )
  );

  return Math.floor(Date.now() / 1000) - Math.floor(clampedYears * 365.25 * 24 * 60 * 60);
}

function normalizeTransactionList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.result?.data)) return payload.result.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// Helius JSON-RPC helper for getTransactionsForAddress
async function fetchHeliusTransactionsForAddress(
  address,
  heliusOptions,
  apiKey = HELIUS_API_KEY
) {
  const data = await safeFetch(
    `https://beta.helius-rpc.com/?api-key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getTransactionsForAddress',
        params: [address, heliusOptions],
      }),
    }
  );

  return data;
}

async function fetchHeliusTransactionsForAddressWithRetry(
  address,
  heliusOptions,
  apiKey = HELIUS_API_KEY
) {
  let attempt = 0;

  for (;;) {
    try {
      return await fetchHeliusTransactionsForAddress(
        address,
        heliusOptions,
        apiKey
      );
    } catch (error) {
      const isRateLimited =
        error instanceof UpstreamError && error.status === 429;

      if (
        !isRateLimited ||
        attempt >= HELIUS_MAX_PAGE_RETRIES
      ) {
        throw error;
      }

      attempt += 1;

      const backoffMs =
        HELIUS_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);

      console.warn(
        `Helius 429 on this page — retrying in ${backoffMs}ms ` +
        `(attempt ${attempt}/${HELIUS_MAX_PAGE_RETRIES})`
      );

      await sleep(backoffMs);
    }
  }
}

async function fetchHeliusChartTransactions(address, cutoffTimestamp) {
  const collected = [];
  const seenSignatures = new Set();
  let paginationToken = null;
  let pagesFetched = 0;
  // Defaults to the "ran out of allowed pages" case; every break point below
  // overwrites this with the actual reason it stopped.
  let endReason = 'page-cap';
  const startedAt = Date.now();

  for (let page = 0; page < HELIUS_MAX_TRANSACTION_PAGES; page++) {
    if (page > 0 && Date.now() - startedAt > HELIUS_TX_TIME_BUDGET_MS) {
      console.warn(`Helius chart pagination stopped after ${page} page(s) — time budget (${HELIUS_TX_TIME_BUDGET_MS}ms) reached.`);
      endReason = 'time-budget';
      break;
    }

    if (page > 0) {
      await sleep(HELIUS_CHART_PAGE_DELAY_MS);
    }

    const heliusOptions = {
      transactionDetails: 'signatures',
      sortOrder: 'desc',
      limit: HELIUS_CHART_PAGE_SIZE,
      filters: {
        status: 'succeeded',
        blockTime: cutoffTimestamp === null ? undefined : { gte: cutoffTimestamp },
      },
    };

    if (paginationToken) heliusOptions.paginationToken = paginationToken;

    let payload;
    try {
      payload = await fetchHeliusTransactionsForAddressWithRetry(
  address,
  heliusOptions,
  HELIUS_CHART_API_KEY
);
    } catch (error) {
      if (page === 0) throw error;
      console.warn(`Helius chart pagination stopped after ${page} page(s) — ${error.message}`);
      endReason = 'provider-error';
      break;
    }

    pagesFetched += 1;

    const batch = normalizeTransactionList(payload);
    if (batch.length === 0) {
      endReason = 'no-more-data';
      break;
    }

    for (const tx of batch) {
      const signature = getTransactionSignature(tx);
      if (signature && seenSignatures.has(signature)) continue;
      if (signature) seenSignatures.add(signature);
      collected.push(tx);
    }

    const last = batch[batch.length - 1];
    paginationToken = payload?.result?.paginationToken ?? null;

    if (!paginationToken || batch.length < HELIUS_CHART_PAGE_SIZE) {
      endReason = 'no-more-data';
      break;
    }
    if (cutoffTimestamp !== null && getTransactionTimestamp(last) !== null && getTransactionTimestamp(last) < cutoffTimestamp) {
      endReason = 'cutoff-reached';
      break;
    }
  }

  // Only page-cap, time-budget, and provider-error mean we stopped short of
  // the real end of the requested window — those are the "partial" cases.
  const partial = endReason === 'page-cap' || endReason === 'time-budget' || endReason === 'provider-error';

  const transactions = cutoffTimestamp === null
    ? collected
    : collected.filter((tx) => {
        const timestamp = getTransactionTimestamp(tx);
        return timestamp === null || timestamp >= cutoffTimestamp;
      });

  return { transactions, partial, pagesFetched };
}

// Recent-transactions data source — the classic Helius Enhanced Transactions
// History REST endpoint, NOT getTransactionsForAddress. getTransactionsForAddress
// (even in "full" mode) returns raw transaction/meta objects with no semantic
// parsing — it has no description/type/source/tokenTransfers/nativeTransfers/
// feePayer fields. Those only come from this endpoint (or POST /v0/transactions),
// which is what describeTransaction(), getRecognizedSourceLabel(), getTxIconClass(),
// and getTxIconSymbol() in app.js depend on. Single call, no pagination needed —
// only the newest 7 are ever rendered.
async function fetchHeliusRecentTransactions(address) {
  const url = new URL(`https://api-mainnet.helius-rpc.com/v0/addresses/${address}/transactions`);
  url.searchParams.set('api-key', HELIUS_API_KEY);
  url.searchParams.set('limit', String(HELIUS_RECENT_LIMIT));

  const payload = await safeFetch(url.toString());
  const batch = normalizeTransactionList(payload);

  return batch.slice(0, HELIUS_RECENT_LIMIT);
}

app.get('/api/transactions/chart', async (req, res) => {
  const { address, years } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  const cutoffTimestamp = getHistoryCutoffTimestamp(years);
  const normalizedAddress = address.trim();

  if (!HELIUS_CHART_API_KEY) {
  return res.status(503).json({
    error:
      'No dedicated Helius chart key configured. Please add HELIUS_BARCHART_TRANSACTION_API_KEY to .env',
  });
}

  try {
    const cacheKey = `${normalizedAddress}:${cutoffTimestamp ?? 'all'}`;
    const cached = getCachedChartResult(cacheKey);
    if (cached) {
      return res.json({ ...cached, source: 'helius', cached: true });
    }

    const { transactions, partial, pagesFetched } = await fetchHeliusChartTransactions(normalizedAddress, cutoffTimestamp);
    if (partial) {
      console.warn(`Wallet activity chart truncated for ${normalizedAddress} — ${pagesFetched} page(s) fetched, ${transactions.length} transaction(s) returned.`);
    }
    if (!partial) {
      setCachedChartResult(cacheKey, { transactions, partial, pagesFetched });
    }
    return res.json({ transactions, source: 'helius', partial, pagesFetched });
  } catch (error) {
    console.error('Wallet activity chart error:', error.message);
    return sendUpstreamFailure(res, error, 'Unable to fetch wallet activity chart. Please try again shortly.');
  }
});

app.get('/api/transactions/recent', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  const normalizedAddress = address.trim();

  if (!HELIUS_API_KEY) {
    return res.status(503).json({
      error: 'No API key configured. Please add HELIUS_API_KEY to .env',
    });
  }

  try {
    const transactions = await fetchHeliusRecentTransactions(normalizedAddress);
    return res.json({ transactions, source: 'helius' });
  } catch (error) {
    console.error('Recent transactions error:', error.message);
    return sendUpstreamFailure(res, error, 'Unable to fetch recent transactions. Please try again shortly.');
  }
});

// ── Route 6 — GET /api/wallet-age?address= ──
// Dedicated, lightweight lookup for the wallet's true first-ever transaction.
// Helius supports fetching the single oldest transaction directly via
// sort-order=asc&limit=1 — one cheap request, not a pagination walk through
// however many pages the wallet's real history spans.
app.get('/api/wallet-age', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  try {
    if (HELIUS_API_KEY) {
      const data = await safeFetch(
        `https://api-mainnet.helius-rpc.com/v0/addresses/${address.trim()}/transactions?api-key=${HELIUS_API_KEY}&limit=1&sort-order=asc`
      );

      const firstTx = Array.isArray(data) ? data[0] : null;
      const rawTimestamp = firstTx?.timestamp ?? firstTx?.blockTime ?? null;
      const firstTransactionTimestamp = Number.isFinite(Number(rawTimestamp)) ? Number(rawTimestamp) : null;

      return res.json({ firstTransactionTimestamp });
    } else if (SHYFT_API_KEY) {
      // Shyft (fallback provider) only supports newest-first pagination
      // (before_tx_signature) — there's no equivalent cheap "oldest
      // transaction" lookup, so age is reported unavailable rather than
      // guessing at a parameter Shyft doesn't document or support.
      return res.json({ firstTransactionTimestamp: null });
    } else {
      return res.status(503).json({
        error: 'No API key configured. Please add HELIUS_API_KEY to .env',
      });
    }
  } catch (error) {
    console.error('Wallet age error:', error.message);
    return sendUpstreamFailure(res, error, 'Unable to fetch wallet age. Solana network may be experiencing delays.');
  }
});

// ════════════════════════════════════════
// ── STATIC FILES ──
// Serve index.html and all frontend files
// ════════════════════════════════════════

// ── Route 8 — GET /api/nft-image-fallback ──
// Serves a placeholder SVG when NFT image fails to load
app.get('/api/nft-image-fallback', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#1a1a26" rx="12"/>
      <text x="100" y="110" font-family="Space Grotesk, sans-serif" font-size="48" fill="#7c5cfc" text-anchor="middle">🖼</text>
    </svg>
  `);
});

// ── Route 9 — GET /api/token-logo-fallback ──
// Serves a placeholder SVG when token logo fails to load
app.get('/api/token-logo-fallback', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="14" fill="#1a1a26"/>
      <circle cx="14" cy="14" r="10" fill="#7c5cfc" opacity="0.3"/>
      <text x="14" y="18" font-family="Space Grotesk, sans-serif" font-size="10" fill="#7c5cfc" text-anchor="middle">?</text>
    </svg>
  `);
});

// ── Route 10 — POST /api/feedback ──
// Accepts anonymous feedback after the server-side spam checks have passed.
app.post('/api/feedback', async (req, res) => {
  const feedback =
    typeof req.body?.feedback === 'string'
      ? req.body.feedback.trim()
      : '';

  const honeypot =
    typeof req.body?.website === 'string'
      ? req.body.website.trim()
      : '';

  const pageLoadedAt = Number(req.body?.pageLoadedAt);
  const focusedAt = Number(req.body?.focusedAt);

  if (!feedback) {
    return res.status(400).json({
      success: false,
      code: 'empty-feedback',
      message: 'Please enter your feedback',
    });
  }

  // Honeypot and keyword/URL checks are intentionally stealth-dropped.
  if (honeypot) {
    return res.json({ success: true });
  }

  const normalizedFeedback = normalizeFeedbackText(feedback);

  if (feedbackContainsBlockedContent(normalizedFeedback)) {
    return res.json({ success: true });
  }

  const now = Date.now();

  const timingFailures = [
    pageLoadedAt,
    focusedAt,
  ].some((startedAt) => (
    Number.isFinite(startedAt) &&
    now >= startedAt &&
    now - startedAt < FEEDBACK_TIMING_THRESHOLD_MS
  ));

  if (timingFailures) {
    return res.status(422).json({
      success: false,
      code: 'too-fast',
      message:
        'You are submitting too fast. Please wait a moment and try again.',
    });
  }

  if (!redis) {
    console.error(
      'Feedback service unavailable: Upstash Redis is not configured.'
    );

    return res.status(503).json({
      success: false,
      code: 'configuration',
      message: 'Feedback service is not configured.',
    });
  }

  if (!BREVO_API_KEY && !RESEND_API_KEY) {
    console.error(
      'Feedback service unavailable: no email provider credentials are configured.'
    );

    return res.status(503).json({
      success: false,
      code: 'configuration',
      message: 'Feedback service is not configured.',
    });
  }

  const feedbackSenderConfigured =
  (BREVO_API_KEY && BREVO_SENDER_EMAIL) ||
  (RESEND_API_KEY && RESEND_SENDER_EMAIL);

if (!FEEDBACK_RECIPIENT_EMAIL || !feedbackSenderConfigured) {
  console.error(
    'Feedback service unavailable: sender/recipient configuration is incomplete.'
  );

  return res.status(503).json({
    success: false,
    code: 'configuration',
    message: 'Feedback service is not configured.',
  });
}

  const correlationId = randomUUID();

  try {
    const sequenceNumber = await redis.incr(getFeedbackCounterKey());

    const subject =
      `FEEDBACK [${sequenceNumber}] - ${getFeedbackDateLabel()}`;

    const delivery = await deliverFeedback(
      feedback,
      subject,
      correlationId
    );

    if (delivery.delivered) {
      return res.json({ success: true });
    }

    if (delivery.bothProvidersFailed) {
      return res.status(503).json({
        success: false,
        code: 'delivery-failed',
        message:
          'Unable to send feedback, please try again later',
        correlationId,
      });
    }

    return res.status(503).json({
      success: false,
      code: 'configuration',
      message: 'Feedback service is not configured.',
      correlationId,
    });
  } catch (error) {
    console.error('Feedback processing failed:', {
      correlationId,
      category: classifyFeedbackProviderFailure(error),
    });

    return res.status(503).json({
      success: false,
      code: 'delivery-failed',
      message:
        'Unable to send feedback, please try again later',
      correlationId,
    });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// ── Serve index.html for all non-API routes ──
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// ════════════════════════════════════════
// ── GLOBAL ERROR HANDLER ──
// ════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Access not allowed.' });
  }
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again shortly.',
  });
});

// ════════════════════════════════════════
// ── START SERVER ──
// ════════════════════════════════════════
app.listen(PORT, () => {
  
  console.log(
  `✅ Ichnite server running on http://localhost:${PORT} (${NODE_ENV})`
);
console.log(
  `🔑 Helius API: ${
    HELIUS_API_KEY ? 'Connected' : '⚠️  Not configured'
  } (metadata + fallback structural data)`
);
  console.log(
  `✉️ Feedback providers: Brevo ${
    BREVO_API_KEY ? 'configured' : '⚠️ missing'
  } | Resend ${
    RESEND_API_KEY ? 'configured' : '⚠️ missing'
  }`
);

console.log(
  `📬 Feedback routing: recipient ${
    FEEDBACK_RECIPIENT_EMAIL ? 'configured' : '⚠️ missing'
  } | Brevo sender ${
    BREVO_SENDER_EMAIL ? 'configured' : '⚠️ missing'
  } | Resend sender ${
    RESEND_SENDER_EMAIL ? 'configured' : '⚠️ missing'
  }`
);

console.log(
  `🔢 Feedback Redis counter: ${
    REDIS_BACKUP_ENABLED
      ? `configured (${FEEDBACK_REDIS_KEY_PREFIX})`
      : '⚠️ Redis not configured'
  }`
);
  console.log(
  `📊 Helius chart API: ${
    HELIUS_BARCHART_TRANSACTION_API_KEY
      ? 'Dedicated key'
      : NODE_ENV === 'development' && HELIUS_API_KEY
        ? 'Development fallback to HELIUS_API_KEY'
        : '⚠️  Not configured'
  } (wallet activity pagination)`
);

console.log(
  `📊 Helius chart tuning: delay=${HELIUS_CHART_PAGE_DELAY_MS}ms, ` +
  `retryBase=${HELIUS_RETRY_BASE_DELAY_MS}ms, ` +
  `retries=${HELIUS_MAX_PAGE_RETRIES}, ` +
  `timeBudget=${HELIUS_TX_TIME_BUDGET_MS}ms, ` +
  `maxPages=${HELIUS_MAX_TRANSACTION_PAGES}, ` +
  `cacheTTL=${HELIUS_CHART_CACHE_TTL_MS}ms, ` +
  `cacheEntries=${HELIUS_CHART_CACHE_MAX_ENTRIES}`
);

console.log(
  `🖼️ Helius NFT pagination: maxPages=${HELIUS_MAX_NFT_PAGES}, ` +
  `pageDelay=${HELIUS_NFT_PAGE_DELAY_MS}ms, ` +
  `maxRetries=${HELIUS_NFT_MAX_PAGE_RETRIES}, ` +
  `retryBase=${HELIUS_NFT_RETRY_BASE_DELAY_MS}ms`
);
  console.log(`🔑 Shyft API: ${SHYFT_API_KEY ? 'Connected' : '⚠️  Not configured'} (structural data fallback only)`);
  console.log(`🔑 Jupiter Price V3: ${JUPITER_API_KEY ? 'Keyed (1 req/sec)' : 'Keyless (0.5 req/sec)'} (primary token pricing)`);
  console.log(`🔑 Raydium V3: Unauthenticated (fallback token pricing)`);
  console.log(`🔑 CoinGecko: ${COINGECKO_API_KEY ? 'Demo tier' : 'Keyless'} (primary SOL price)`);
  console.log(`🔑 CoinMarketCap: ${CMC_API_KEY ? 'Connected' : '⚠️  Not configured'} (SOL price fallback)`);
    console.log(
  `🗄️ Redis rate-limit backup: ${
    REDIS_BACKUP_ENABLED ? 'configured' : 'disabled'
  } (prefix ${REDIS_KEY_PREFIX}; ${REDIS_KEY_PREFIX_SOURCE})`
);

console.log(
  `🔢 Feedback Redis counter: ${
    REDIS_BACKUP_ENABLED ? 'available' : 'unavailable'
  } (prefix ${FEEDBACK_REDIS_KEY_PREFIX}; ${FEEDBACK_REDIS_KEY_PREFIX_SOURCE})`
);
  const allowedOriginList = [...allowedOrigins];
  console.log(`🔒 Trust proxy: ${describeTrustProxySetting(trustProxySetting)}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOriginList.length ? allowedOriginList.join(', ') : '(none configured)'}`);
});