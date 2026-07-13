// ── SolTrace Backend Server ──
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
// Trust first proxy hop (Vercel/StackBlitz) so express-rate-limit
// can correctly resolve real client IPs from X-Forwarded-For
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Allowed Origins ──
// In development — allow localhost
// In production — allow only your Vercel domain
const allowedOrigins =
  NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000', new RegExp(`^https://${process.env.CODESPACE_NAME}-\\d+\\.app\\.github\\.dev$`)]
    : ['https://soltrace.vercel.app'];

// ── Security Middleware — applied before all routes ──

// 1. Helmet — sets secure HTTP headers
app.use(helmet());

// 2. CORS — only allow requests from SolTrace frontend
const corsOptions = {  
  origin: function (origin, callback) {  
    // Allow requests with no Origin (Postman, curl, server-to-server)  
    if (!origin) {  
      console.log('✅ Allowing request with no Origin header');  
      return callback(null, true);  
    }  
      console.log('Origin:', origin);
  
    // Allow this Codespace frontend  
    const codespaceName = process.env.CODESPACE_NAME;  
    if (codespaceName) {  
      const codespaceRegex = new RegExp(  
        `^https://${codespaceName}-\\d+\\.app\\.github\\.dev$`  
      );  
  
      if (codespaceRegex.test(origin)) {  
        console.log(`✅ Allowed Codespaces origin: ${origin}`);  
        return callback(null, true);  
      }  
    }  
        
      //AllowedOrigins   
     if (allowedOrigins.includes(origin)) {  
  return callback(null, true);  
    }  
  
    // Allow localhost during development  
    if (origin.startsWith('http://localhost')) {  
      console.log(`✅ Allowed localhost origin: ${origin}`);  
      return callback(null, true);  
    }  
  
    console.error(`❌ Blocked CORS request from origin: ${origin}`);  
    return callback(new Error('Not allowed by CORS'));  
  },  
  methods: ['GET'],  
  allowedHeaders: ['Content-Type'],  
};  
  
app.use(cors(corsOptions));  

// 3. Rate limiting — prevent API abuse
// 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.',
  },
});

// Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// 4. JSON body parser
app.use(express.json());

// ── API Keys — loaded from .env — never sent to browser ──
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const SHYFT_API_KEY = process.env.SHYFT_API_KEY;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

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
  try {
    const url =
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true';

    const headers = {};

    // Add API key header if Pro tier key is available
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    const data = await safeFetch(url, { headers });

    // Return only what frontend needs — never expose raw API response
    res.json({
      price: data.solana.usd,
      change24h: data.solana.usd_24h_change,
    });
  } catch (error) {
    console.error('SOL price error:', error.message);
    res.status(503).json({
      error: 'Unable to fetch SOL price. Please try again shortly.',
    });
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
    res.status(503).json({
      error: 'Unable to fetch SOL balance. Solana network may be experiencing delays.',
    });
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
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
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
      const mints = [...new Set(accounts.map((t) => t.mint))];
      const metadataMap = await resolveTokenMetadata(mints);

      mappedTokens = accounts.map((t) => {
        const meta = metadataMap.get(t.mint);
        return {
          mint: t.mint,
          amount: t.amount,
          symbol: meta?.symbol || t.mint.slice(0, 4) + '...' + t.mint.slice(-4),
          name: meta?.name || null,
          logoURI: meta?.logoURI || null,
        };
      });

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

// Resolves symbol/name/logo for a list of mints via Helius getAssetBatch.
// Chunked at 1000 ids per call (Helius's documented batch limit).
async function resolveTokenMetadata(mints) {
  const metadataMap = new Map();
  if (mints.length === 0) return metadataMap;

  const CHUNK_SIZE = 1000;
  const chunks = [];
  for (let i = 0; i < mints.length; i += CHUNK_SIZE) {
    chunks.push(mints.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    try {
      const data = await safeFetch(
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getAssetBatch',
            params: { ids: chunk },
          }),
        }
      );
      
      console.log(JSON.stringify(data.result?.[0], null, 2));

      const assets = Array.isArray(data.result) ? data.result : [];
      for (const asset of assets) {
        if (!asset || !asset.id) continue;
        const meta = asset.content?.metadata || {};
        const image =
          asset.content?.links?.image ||
          asset.content?.files?.[0]?.uri ||
          null;

        metadataMap.set(asset.id, {
          symbol: meta.symbol || null,
          name: meta.name || null,
          logoURI: image,
        });
      }
    } catch (err) {
      // Metadata resolution failing shouldn't break the whole response —
      // affected tokens just fall back to the truncated-mint display.
      console.error('Metadata batch error:', err.message);
    }
  }

  return metadataMap;
}

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

// ── Route 6 — GET /api/token-prices?ids= ──
// Fetches live USD prices for multiple tokens from CoinGecko
// ids = comma separated CoinGecko token ids e.g. jupiter-ag,usd-coin
app.get('/api/token-prices', async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: 'Token ids are required.' });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;

    const headers = {};
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    const data = await safeFetch(url, { headers });

    res.json(data);
  } catch (error) {
    console.error('Token price error:', error.message);
    res.status(503).json({
      error: 'Unable to fetch token prices. Please try again shortly.',
    });
  }
});

// ── Route 7 — GET /api/token-logos?symbol= ──
// Fetches token logo URL from CoinGecko by symbol
app.get('/api/token-logos', async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Token symbol is required.' });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`;

    const headers = {};
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    const data = await safeFetch(url, { headers });

    // Return only the first matching coin logo
    const coin = data.coins?.[0];
    res.json({
      logo: coin?.large || coin?.thumb || null,
      name: coin?.name || null,
    });
  } catch (error) {
    console.error('Token logo error:', error.message);
    res.status(503).json({
      error: 'Unable to fetch token logo.',
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
  console.log(`✅ SolTrace server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔑 Helius API: ${HELIUS_API_KEY ? 'Connected' : '⚠️  Not configured'}`);
  console.log(`🔑 Shyft API: ${SHYFT_API_KEY ? 'Connected' : '⚠️  Not configured'}`);
  console.log(`🔑 CoinGecko: ${COINGECKO_API_KEY ? 'Pro tier' : 'Free tier'}`);
});