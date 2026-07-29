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
app.use(helmet());

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

// Shared key helper so the limiter and the status endpoint read the same user bucket.
function getRateLimitKey(req) {
  return req.ip;
}

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req) => {
    // req.rateLimit.resetTime is a Date — the documented, reliable way to
    // access reset info, rather than guessing from headers.
    const resetTime = req.rateLimit?.resetTime;
    const resetAt = resetTime instanceof Date
      ? resetTime.getTime()
      : Number(resetTime);

    const secondsLeft = Number.isFinite(resetAt)
      ? Math.max(0, Math.ceil((resetAt - Date.now()) / 1000))
      : 0;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return {
      error: 'Too many requests. Please try again later.',
      timeRemaining: `${minutes}m ${seconds}s`,
      retryAfterSeconds: secondsLeft,
      resetAt: Number.isFinite(resetAt) ? resetAt : null,
    };
  },
});

// ── Rate-limit status endpoint ──
// Registered BEFORE app.use('/api', apiLimiter) below, so requests to this
// path never pass through the limiter middleware — it can't be blocked,
// and it doesn't consume a hit against the same budget.
app.get('/api/rate-limit-status', async (req, res) => {
  try {
    const rateLimitKey = getRateLimitKey(req);
    const info = await apiLimiter.getKey(rateLimitKey);

    if (!info) {
      return res.json({
        rateLimited: false,
        remaining: RATE_LIMIT_LIMIT,
        retryAfterSeconds: 0,
        resetAt: null,
      });
    }

    const totalHits = Number(info.totalHits ?? 0);
    const remaining = Math.max(0, RATE_LIMIT_LIMIT - totalHits);
    const resetAt = info.resetTime instanceof Date
      ? info.resetTime.getTime()
      : Number(info.resetTime);

    const retryAfterSeconds = Number.isFinite(resetAt)
      ? Math.max(0, Math.ceil((resetAt - Date.now()) / 1000))
      : 0;

    return res.json({
      rateLimited: remaining <= 0,
      remaining,
      retryAfterSeconds,
      resetAt: Number.isFinite(resetAt) ? resetAt : null,
    });
  } catch (error) {
    console.error('Rate-limit status error:', error.message);
    return res.json({
      rateLimited: false,
      remaining: null,
      retryAfterSeconds: 0,
      resetAt: null,
      error: 'Unable to verify rate limit right now.',
    });
  }
});

// Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// 4. JSON body parser
app.use(express.json());

// ── API Keys — loaded from .env — never sent to browser ──
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
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
async function safeFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
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
    res.status(503).json({ error: 'Unable to fetch SOL price. Please try again shortly.' });
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
      }
    }

    res.status(503).json({
      error: 'Unable to fetch SOL balance. Solana network may be experiencing delays.',
    });
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

// Stage 1 — Helius DAS getAssetBatch (metadata + price, requires showFungibleTokens)
async function resolveTokenMetadata(mints) {
  const metadataMap = new Map();
  if (mints.length === 0) return metadataMap;

  const CHUNK_SIZE = 1000;
  const chunks = [];
  for (let i = 0; i < mints.length; i += CHUNK_SIZE) {
    chunks.push(mints.slice(i, i + CHUNK_SIZE));
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
                displayOptions: { showFungible: true }, // REQUIRED for token_info/price_info
              },
            }),
          }
        );

        const assets = Array.isArray(data.result) ? data.result : [];
        for (const asset of assets) {
          if (!asset || !asset.id) continue;
          const meta = asset.content?.metadata || {};
          const image =
            asset.content?.links?.image ||
            asset.content?.files?.[0]?.uri ||
            null;
          const tokenInfo = asset.token_info || {};

          metadataMap.set(asset.id, {
            symbol: meta.symbol || tokenInfo.symbol || null,
            name: meta.name || null,
            logoURI: image,
            decimals: typeof tokenInfo.decimals === 'number' ? tokenInfo.decimals : 0,
            interface: asset.interface || null,
            // Metadata only — pricing now comes exclusively from Jupiter (primary) / Raydium (fallback)
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
    const mintList = mints.filter(Boolean);
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
      const preMints = preFilter.map((t) => t.mint);

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
      const mints = filtered.map((t) => t.mint);

      // Stage 2 — Jupiter: primary live pricing for EVERY mint
      const jupiterPrices = await resolveJupiterPrices(mints);

      // Stage 3 — Raydium: fallback only for mints Jupiter omitted
      const missingAfterJupiter = mints.filter((mint) => !jupiterPrices.has(mint));
      const raydiumPrices = await resolveRaydiumPrices(missingAfterJupiter);

      mappedTokens = filtered
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
            amount: rawAmountToDecimal(t.amount, decimals), // BigInt-safe
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
    res.status(503).json({
      error: 'Unable to fetch token holdings. Please try again shortly.',
    });
  }
});


// ── Route 4 — GET /api/nfts?address= ──
// Fetches NFT holdings from Helius or Shyft
app.get('/api/nfts', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  }

  try {
    let data;

    if (HELIUS_API_KEY) {
      // Primary — Helius DAS API
      data = await safeFetch(
        `https://beta.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: address.trim(),
              page: 1,
              limit: 100,
            },
          }),
        }
      );

      res.json({
        nfts: data.result?.items || [],
      });
    } else if (SHYFT_API_KEY) {
      // Backup — Shyft API
      data = await safeFetch(
        `https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address=${address.trim()}`,
        {
          headers: { 'x-api-key': SHYFT_API_KEY },
        }
      );

      res.json({
        nfts: data.result || [],
      });
    } else {
      return res.status(503).json({
        error: 'No API key configured. Please add HELIUS_API_KEY to .env',
      });
    }
  } catch (error) {
    console.error('NFT error:', error.message);
    res.status(503).json({
      error: 'Unable to fetch NFTs. Please try again shortly.',
    });
  }
});

// ── Route 5 — GET /api/transactions?address= ──
// Fetches transaction history from Helius or Shyft
app.get('/api/transactions', async (req, res) => {
  const { address } = req.query;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address.' });
  } 

  try {
    let data;

    if (HELIUS_API_KEY) {
      // Primary — Helius Enhanced Transactions API
      data = await safeFetch(
        `https://api-mainnet.helius-rpc.com/v0/addresses/${address.trim()}/transactions?api-key=${HELIUS_API_KEY}&limit=100`
      );

      res.json({
        transactions: data || [],
      });
    } else if (SHYFT_API_KEY) {
      // Backup — Shyft API
      data = await safeFetch(
        `https://api.shyft.to/sol/v1/transaction/history?network=mainnet-beta&account=${address.trim()}&limit=100`,
        {
          headers: { 'x-api-key': SHYFT_API_KEY },
        }
      );

      res.json({
        transactions: data.result || [],
      });
    } else {
      return res.status(503).json({
        error: 'No API key configured. Please add HELIUS_API_KEY to .env',
      });
    }
  } catch (error) {
    console.error('Transaction error:', error.message);
    res.status(503).json({
      error: 'Unable to fetch transactions. Solana network may be experiencing delays.',
    });
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

app.use(express.static('.'));

// ── Serve index.html for all non-API routes ──
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '.' });
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
  
  console.log(`✅ Ichnite server running on http://localhost:${PORT}`);
  console.log(`🔑 Helius API: ${HELIUS_API_KEY ? 'Connected' : '⚠️  Not configured'} (metadata + fallback structural data)`);
  console.log(`🔑 Shyft API: ${SHYFT_API_KEY ? 'Connected' : '⚠️  Not configured'} (structural data fallback only)`);
  console.log(`🔑 Jupiter Price V3: ${JUPITER_API_KEY ? 'Keyed (1 req/sec)' : 'Keyless (0.5 req/sec)'} (primary token pricing)`);
  console.log(`🔑 Raydium V3: Unauthenticated (fallback token pricing)`);
  console.log(`🔑 CoinGecko: ${COINGECKO_API_KEY ? 'Demo tier' : 'Keyless'} (primary SOL price)`);
  console.log(`🔑 CoinMarketCap: ${CMC_API_KEY ? 'Connected' : '⚠️  Not configured'} (SOL price fallback)`);
  const allowedOriginList = [...allowedOrigins];
  console.log(`🔒 Trust proxy: ${describeTrustProxySetting(trustProxySetting)}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOriginList.length ? allowedOriginList.join(', ') : '(none configured)'}`);
});