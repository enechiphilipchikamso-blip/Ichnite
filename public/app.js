//// ════════════════════════════════════════
// ── Ichnite app.js ──
// Frontend JavaScript — connects to server.js backend
// Never calls external APIs directly — all calls go through /api routes
// ════════════════════════════════════════

'use strict';

/// ════════════════════════════════════════
// ── 1. CONFIGURATION — named constants frozen ──
/// ════════════════════════════════════════

const CONFIG = Object.freeze({
  RATE_LIMIT_MS: 3000,
  LIVE_UPDATE_INTERVAL: 60000,
  MAX_HISTORY: 3,
  SCROLL_THRESHOLD: 300,
  DAYS_COUNT: 7,
  MONTH_COUNT: 6,
  COPY_RESET_DELAY: 2000,
  CHART_DRAW_DELAY: 300,
  MAX_ADDRESS_LENGTH: 44,
  MAX_RECENT_TX: 7,
    // sol-price + sol-balance + tokens + nfts + chart + recent + wallet-age — guaranteed base.
  // wallet-age stays dedicated and unchanged; chart and recent are now separate calls.
  TRACE_REQUEST_COST: 7,
  TRACE_MAX_CONCURRENT_REQUESTS: 3,
  // Transaction rendering can still add /api/token-metadata for the 7 recent rows only.
  TRACE_REQUEST_COST_MAX: 8,
});

// ════════════════════════════════════════
// ── 2.
// ════════════════════════════════════════


// ════════════════════════════════════════
// ── 3. TOKEN BRAND COLORS ──
// ════════════════════════════════════════

const TOKEN_COLORS = Object.freeze({
  SOL: '#9945FF',
  JUP: '#5EE9B5',
  JTO: '#3B82F6',
  BONK: '#FC8E03',
  WIF: '#E8C460',
  POPCAT: '#FF6B6B',
  PENGU: '#A8D8EA',
  FARTCOIN: '#8BC34A',
  AI16Z: '#7C3AED',
  GIGA: '#EF4444',
  TRUMP: '#B91C1C',
  MELANIA: '#EC4899',
  BOME: '#F59E0B',
  MEW: '#10B981',
  PNUT: '#92400E',
  DRIFT: '#6366F1',
  KMNO: '#0EA5E9',
  ORCA: '#00B2C8',
  RAY: '#4DA2FF',
  MNDE: '#FF6B35',
  TNSR: '#8B5CF6',
  W: '#F97316',
  HNT: '#474DFF',
  MOBILE: '#009FF9',
  ARC: '#14B8A6',
  GRASS: '#22C55E',
  USDC: '#2775CA',
  USDT: '#26A17B',
  PYTH: '#6D28D9',
  ETH: '#627EEA',
  WBTC: '#F7931A',
  cbBTC: '#0052FF',
  ZEC: '#F4B728',
  XMR: '#FF6600',
  UNI: '#FF007A',
  AAVE: '#B6509E',
  AVAX: '#E84142',
  SUI: '#4DA2FF',
  CHZ: '#CD0124',
  APE: '#0054FA',
  BAT: '#FF5000',
  DAI: '#F5AC37',
  EURC: '#2775CA',
  PUMP: '#5FCB88',
  USDG: '#000000',
  PYUSD: '#0070E0',
  JLP: '#5EE9B5',
  JupSOL: '#5EE9B5',
  jlUSDC: '#2775CA',
  SKHY: '#E31837',
  RENDER: '#E4373A',
  TAO: '#0DBFA7',
  ANSEM: '#D4A017',
  ANTFUN: '#8B5A2B',
  CASH: '#16A34A',
  CRED: '#2563EB',
  ONyc: '#1E3A8A',
  AVA: '#7C3AED',
  USX: '#22C55E',
  HYPE: '#97FCE4',
  JitoSOL: '#7DFFB3',
  USD1: '#D4AF37',
  USDS: '#1AAB9B',
  USDe: '#000000',
  syrupUSDC: '#FF6900',
  SPCX: '#000000',
  MET: '#F4A100',
  USELESS: '#6B7280',
  TROLL: '#4ADE80',
  TRX: '#EB0029',
  NVDAx: '#76B900',
  MSTRx: '#FA660F',
  PSOL: '#AB9FF2',
  xBTC: '#000000',
  SNDK: '#E10600',
  DBR: '#FBFF3A',
  CRCLx: '#2775CA',
  MU: '#0077C8',
  tKalshi: '#4DE4B2',
  tOpenAI: '#000000',
  mSOL: '#4CD4A0',
  bSOL: '#FF7A00',
  ZBCN: '#7C3AED',
  SPYx: '#003087',
  SPX: '#1E3A8A',
  INF: '#8B5CF6',
  BP: '#FFD60A',
  SKR: '#9945FF',
  DRAM: '#6B7280',
  TSLAx: '#E82127',
  MORPHO: '#004EC3',
  BORG: '#01C38D',
  KITTY: '#ED164F',
  ATLAS: '#D14836',
  NOS: '#10E80C',
  JupUSD: '#5EE9B5',
  jlUSDT: '#26A17B',
  jlUSDG: '#000000',
  jlWSOL: '#9945FF',
  wNEAR: '#000000',
  PAXG: '#D4AF37',
  XAUt0: '#C9A227',
  ANTHROPIC: '#DA7756',
  ARG: '#75AADB',
  Spain: '#AA151B',
  VINE: '#00B489',
  jlUSDS: '#6698FF',
  MNGO: '#F5A623',
  HONEY: '#FFB300',
  QQQx: '#0092BC',
  MON: '#6E54FF',
  bbSOL: '#F7A600',
  zBTC: '#F7931A',
  KERMIT: '#5CB200',
  hSOL: '#9945FF',
  GOAT: '#8B9B6E',
  FWOG: '#7CB342',
  MOODENG: '#F8A5C2',
  MYRO: '#C89F70',
  DEGEN: '#A855F7',
  CATWIF: '#D4A574',
  VIRTUAL: '#4F7FFF',
  GEOD: '#2563EB',
  HUMA: '#3B82F6',
  SAROS: '#6366F1',
  NATIX: '#22C55E',
  LIT: '#18181B',
  BOXABL: '#1E3A8A',
  WINGS: '#38BDF8',
  FDUSD: '#4AFAB4',
  Cake: '#D1884F',
  Ton: '#00A8E0',
  HOOD: '#00C805',
  GME: '#FD0000',
  AAPLx: '#000000',
  AMZNx: '#FF9900',
  GOOGLx: '#4285F4',
  METAx: '#0866FF',
  NFLXx: '#E50914',
  KOx: '#F40009',
  Vx: '#1A1F71',
  IBMx: '#0F62FE',
  WMTx: '#0071CE',
  ORCLx: '#F80000',
  CSCOx: '#1BA0D7',
  ADBEx: '#FF0000',
  COINx: '#0052FF',
  UBERx: '#000000',
  CRMx: '#00A1E0',
  HDx: '#F96302',
  PEPx: '#004B93',
  INTCx: '#0071C5',
  AMDx: '#ED1C24',
  PYPLx: '#003087',
  MSFTx: '#00A4EF',
  AVGOx: '#CC092F',
  JPMx: '#117ACA',
  CVXx: '#0056A2',
  GSx: '#7399C6',
  PLTRx: '#000000',
  MCDx: '#FFC72C',
  PGx: '#003DA5',
  JNJx: '#D50032',
  XOMx: '#DA291C',
  HONx: '#ED1C24',
  BACx: '#012169',
  MAx: '#EB001B',
  PFEx: '#0093D0',
  CRWDx: '#FC0000',
  ACNx: '#A100FF',
  DELLx: '#007DB8',
  AZNx: '#830051',
  GMEx: '#FD0000',
  RBLXx: '#E2231A',
  TMOx: '#E4002B',
  ABTx: '#0057B8',
  MDTx: '#004B87',
  SPCXx: '#000000',
  HOODx: '#00C805',
  SNDKx: '#E10600',
  DEFAULT: '#7c5cfc',
});

// ════════════════════════════════════════
// ── 4. API BASE URL ──
// ════════════════════════════════════════

const hostname = window.location.hostname;

const API_BASE =
  hostname === 'localhost' || hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : hostname.endsWith('.app.github.dev')
      ? `https://${hostname.replace(/-\d+\.app\.github\.dev$/, '-3000.app.github.dev')}`
      : '';

// ════════════════════════════════════════
// ── 5. STATE VARIABLES ──
// ════════════════════════════════════════

let currentWalletAddress = '';
let currentSolPrice = 0;
let currentSolBalance = 0;
let currentYearSelection = 1;
let currentBarRange = 'days';
let liveUpdateInterval = null;
let liveUpdateFailures = 0;
let lastSearchTime = 0;
let allTokens = [];
let allChartTransactions = [];
let allRecentTransactions = [];
let chartDataIsPartial = false; // true when the backend stopped paginating early (page cap, time budget, or a later-page provider error) — older activity within the selected range may be missing
let chartPagesFetched = 0;
let pieChartInstance = null;
let barChartInstance = null;
let solFetchFailed = false;
let tokenFetchFailed = false;
let barDataAvailable = false;
let yearRangeActive = false;
let barCardRevealed = false;
let tokenDataAvailable = false;
let netWorthRevealed = false;
let tokenCardRevealed = false;
let solBalanceFailed = false;
let solPriceFailed = false;
let solAgeFailed = false;
let solCardRevealed = false;
let inputValidTimeout = null;
let failedFetchCount = 0; // legacy — superseded by cardFailureOutcomes/finalizeCardFailures, left in place (unread, harmless)
let cardFailureOutcomes = {};
let hardFailureOverrideActive = false;
let lastRateLimitInfo = null;
let rateLimitedUntil = null;
let rateLimitStateKind = null;
let rateLimitTickInterval = null;
let rateLimitRestoreInFlight = null;

//AbortController — cancel stale requests
let currentAbortController = null;
let liveUpdateAbortController = null;

// Batch 03: feedback widget state is intentionally in-memory only.
let feedbackIsOpen = false;
let feedbackHelperResetTimer = null;
let feedbackPageLoadedAt = Date.now();
let feedbackFocusedAt = null;
let feedbackSubmitting = false;

// Batch 01: keep the fixed trace workload independent while bounding active
// browser/API requests to the approved maximum of three. Queued work starts
// immediately when a slot becomes available, and aborted queued work is
// removed before it can create a network request.
const traceRequestQueue = [];
let activeTraceRequestCount = 0;

function createTraceAbortError() {
  const error = new Error('Trace request aborted');
  error.name = 'AbortError';
  return error;
}

function pumpTraceRequestQueue() {
  while (
    activeTraceRequestCount < CONFIG.TRACE_MAX_CONCURRENT_REQUESTS &&
    traceRequestQueue.length > 0
  ) {
    const job = traceRequestQueue.shift();
    if (!job) continue;

    if (job.signal?.aborted) {
      job.cleanup();
      job.reject(createTraceAbortError());
      continue;
    }

    job.started = true;
    activeTraceRequestCount += 1;

    Promise.resolve()
      .then(() => {
        if (job.signal?.aborted) {
          throw createTraceAbortError();
        }
        return job.request();
      })
      .then(job.resolve, job.reject)
      .finally(() => {
        job.cleanup();
        activeTraceRequestCount -= 1;
        pumpTraceRequestQueue();
      });
  }
}

function scheduleTraceRequest(request, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createTraceAbortError());
      return;
    }

    const job = {
      request,
      signal,
      resolve,
      reject,
      started: false,
      abortHandler: null,
      cleanup() {
        if (this.signal && this.abortHandler) {
          this.signal.removeEventListener('abort', this.abortHandler);
          this.abortHandler = null;
        }
      },
    };

    if (signal) {
      job.abortHandler = () => {
        if (job.started) return;

        const queueIndex = traceRequestQueue.indexOf(job);
        if (queueIndex !== -1) {
          traceRequestQueue.splice(queueIndex, 1);
        }

        job.cleanup();
        reject(createTraceAbortError());
      };

      signal.addEventListener('abort', job.abortHandler, { once: true });
    }

    traceRequestQueue.push(job);
    pumpTraceRequestQueue();
  });
}

// Batch 02 — in-memory client reuse only. Nothing is persisted to browser
// storage, so a hard refresh clears these caches normally.
const CLIENT_TOKEN_METADATA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CLIENT_NFT_CACHE_TTL_MS = 15 * 60 * 1000;
const CLIENT_NFT_IMAGE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CLIENT_CACHE_MAX_ENTRIES = 1000;

const clientTokenMetadataCache = new Map();
const clientNftCache = new Map();
const clientNftImageCache = new Map();

function getClientCacheValue(cache, key) {
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

function setClientCacheValue(cache, key, value, ttlMs) {
  if (value === undefined || value === null) return;

  cache.delete(key);

  while (cache.size >= CLIENT_CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function primeClientTokenMetadataCache(tokens) {
  if (!Array.isArray(tokens)) return;

  for (const token of tokens) {
    const mint = token?.mint?.trim();
    if (!mint) continue;

    setClientCacheValue(
      clientTokenMetadataCache,
      mint,
      {
        symbol: token.symbol ?? null,
        name: token.name ?? null,
      },
      CLIENT_TOKEN_METADATA_CACHE_TTL_MS
    );
  }
}

function primeClientNftImageCache(nfts) {
  if (!Array.isArray(nfts)) return;

  for (const nft of nfts) {
    const assetId = nft?.id || nft?.assetId || nft?.asset_id;
    const image =
      nft?.content?.links?.image ||
      nft?.content?.files?.[0]?.uri ||
      nft?.image ||
      '';

    if (assetId && image) {
      setClientCacheValue(
        clientNftImageCache,
        `asset:${assetId}`,
        image,
        CLIENT_NFT_IMAGE_CACHE_TTL_MS
      );
    }
  }
}

function removeAllById(id) {
  document.querySelectorAll(`[id="${id}"]`).forEach((node) => node.remove());
}

function clearRuntimeMessageNodes() {
  [
    'netWorthError',
    'netWorthEmpty',
    'netWorthPending',
    'solBalanceError',
    'solPriceError',
    'solCardFullError',
    'barChartError',
    'barChartEmpty',
  ].forEach(removeAllById);
}

// ════════════════════════════════════════
// ── 6. DOM ELEMENTS ──
// ════════════════════════════════════════

const walletInput = document.getElementById('walletInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const errorMsg = document.getElementById('errorMsg');
const networkErrorMsg = document.getElementById('networkErrorMsg');
const emptySearchMsg = document.getElementById('emptySearchMsg');
const resultsSection = document.getElementById('results');
const walletDisplay = document.getElementById('walletDisplay');
const truncatedAddressEl = document.getElementById('truncatedAddress');
const copyAddressBtn = document.getElementById('copyAddressBtn');
const shareWalletBtn = document.getElementById('shareWalletBtn');
const searchHistory = document.getElementById('searchHistory');
const historyChips = document.getElementById('historyChips');
const backToTopBtn = document.getElementById('backToTopBtn');
const totalNetWorth = document.getElementById('totalNetWorth');
const netWorthSkeleton = document.getElementById('netWorthSkeleton');
const netWorthLabel = document.querySelector('.net-worth-label');
const netWorthValue = document.getElementById('netWorthValue');
const solSkeleton = document.getElementById('solSkeleton');
const solBalanceRow = document.getElementById('solBalanceRow');
const solLogo = document.getElementById('solLogo');
const solPriceEl = document.getElementById('solPrice');
const solPriceChange = document.getElementById('solPriceChange');
const solBalanceEl = document.getElementById('solBalance');
const solBalanceUsd = document.getElementById('solBalanceUsd');
const walletAgeEl = document.getElementById('walletAge');
const tokenSkeleton = document.getElementById('tokenSkeleton');
const tokenList = document.getElementById('tokenList');
const tokenTotalValue = document.getElementById('tokenTotalValue');
const tokenSearch = document.getElementById('tokenSearch');
const tokenSort = document.getElementById('tokenSort');
const tokenTotalSkeleton = document.getElementById('tokenTotalSkeleton');
const pieSkeleton = document.getElementById('pieSkeleton');
const pieSpinner = document.getElementById('pieSpinner');
const pieChart = document.getElementById('pieChart');
const nftSkeleton = document.getElementById('nftSkeleton');
const nftList = document.getElementById('nftList');
const nftGrid = document.getElementById('nftGrid');
const nftCountBadge = document.getElementById('nftCountBadge');
const toggleBtns = document.querySelectorAll('.toggleBtn');
const yearDropdown = document.getElementById('yearDropdown');
const yearOptions = document.querySelectorAll('.yearOption');
const yearToggleBtn = document.querySelector('[data-range="year"]');
const barSkeleton = document.getElementById('barSkeleton');
const barSpinner = document.getElementById('barSpinner');
const barChart = document.getElementById('barChart');
const last7txList = document.getElementById('last7txList');
const txSkeleton = document.getElementById('txSkeleton');
const solscanLink = document.getElementById('solscanLink');
const seemore = document.getElementById('seemore');
const accordionBtns = document.querySelectorAll('.accordion-btn');
const infoAccordions = document.querySelectorAll('.accordion.full-width');
const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
const feedbackWidget = document.getElementById('feedbackWidget');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackToggle = document.getElementById('feedbackToggle');
const feedbackContent = document.getElementById('feedbackContent');
const feedbackText = document.getElementById('feedbackText');
const feedbackWebsite = document.getElementById('feedbackWebsite');
const feedbackHelper = document.getElementById('feedbackHelper');
const feedbackSend = document.getElementById('feedbackSend');
const feedbackLandingMount = document.getElementById('feedbackLandingMount');
const feedbackResultsMount = document.getElementById('feedbackResultsMount');

// ════════════════════════════════════════
// ── 7. SERVICE WORKER REGISTRATION ──
// Improvement 8: Better service worker path handling
// ════════════════════════════════════════

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Derive base path dynamically for flexible deployment
    const swPath = new URL('sw.js', window.location.href).pathname;
    navigator.serviceWorker.register(swPath)
      .then(() => console.log('✅ Ichnite SW registered'))
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ════════════════════════════════════════
// ── 8. UTILITY FUNCTIONS ──
// ════════════════════════════════════════

function show(el) {
  if (el) el.classList.remove('hidden');
}

function hide(el) {
  if (el) el.classList.add('hidden');
}

// Generic debounce — collapses a rapid burst of calls into one call,
// fired `delayMs` after the last call in the burst. Used below for the
// browser's online/offline events, which can fire repeatedly in quick
// succession on a flaky connection.
function debounce(fn, delayMs) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

// navigator.onLine and the online/offline events are heuristics about the
// network INTERFACE, not the real internet connection, and are documented
// as unreliable in both directions: they can fire a false "offline" (e.g.
// toggling a VPN), and — the failure mode this app was hit by — the
// matching "online" event is not guaranteed to fire at all when a real
// connection (e.g. mobile data) comes back, which can leave the offline
// banner stuck forever with no user action able to clear it except a full
// page reload. This function verifies REAL connectivity by hitting our
// own /api/ping route (bypasses rate limiting, does no real backend work
// — see server.js) with a 5-second timeout, and checks the exact expected
// response body — not just an HTTP 2xx status — so a captive portal or
// intercepting proxy returning its own "successful-looking" page is still
// correctly treated as NOT a real connection.
// Result shape distinguishes three genuinely different situations, since
// treating them all as one flat "offline" is what caused the banner to
// get stuck retrying forever on an unexpected non-2xx response (e.g. a
// 429 from an intermediary the app itself never issues — server.js
// explicitly exempts /api/ping from its own rate-limit/lockout logic, so
// a 429 here can only be coming from something outside this app, such as
// a hosting platform's edge/proxy layer):
//   'online'     — got exactly the expected 200 + { ok: true } body.
//   'offline'    — the request itself failed at the network level, or
//                  timed out. This is a real signal of no connectivity.
//   'unexpected' — got A response, just not the one we expect (wrong
//                  status like 429, or a 200 with a different body, e.g.
//                  a captive portal or proxy page). This is NOT proof of
//                  being offline — the server was reachable, something
//                  just intercepted or altered the response.
async function checkPingResult() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE}/api/ping`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) return 'unexpected';

    const body = await response.json().catch(() => null);
    return body?.ok === true ? 'online' : 'unexpected';
  } catch {
    return 'offline';
  } finally {
    clearTimeout(timeoutId);
  }
}

// Consecutive 'unexpected' results (e.g. repeated 429s that this app's
// own rate-limit logic cannot be the source of) are capped — after this
// many in a row, stop trusting the ping route's status/body alone and
// fall back to the one signal an intermediary proxy can't fake: whether
// a real fetch to the ping URL fails outright (network-level) or not,
// judged purely by promise rejection, ignoring status/body entirely.
const MAX_CONSECUTIVE_UNEXPECTED_PINGS = 2;
let consecutiveUnexpectedPings = 0;

async function checkRawNetworkReachability() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    await fetch(`${API_BASE}/api/ping`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    // Reaching here means SOME response came back, of any shape — the
    // network path itself is working, even if the response content is
    // one we don't recognize (proxy, captive portal, unrelated 429).
    return true;
  } catch {
    // fetch() only rejects on a genuine network-level failure (DNS
    // failure, connection refused, timeout via our own AbortController)
    // — never on a non-2xx HTTP status, which always resolves normally.
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function verifyRealConnectivity() {
  const result = await checkPingResult();

  if (result === 'online') {
    consecutiveUnexpectedPings = 0;
    return true;
  }

  if (result === 'offline') {
    consecutiveUnexpectedPings = 0;
    return false;
  }

  // result === 'unexpected'
  consecutiveUnexpectedPings++;
  if (consecutiveUnexpectedPings < MAX_CONSECUTIVE_UNEXPECTED_PINGS) {
    // Give the ping route a couple more tries before falling back —
    // a single stray non-2xx response could just be transient noise.
    return false;
  }

  // Hit the cap: stop trusting the ping route's status/body, and fall
  // back to raw network reachability instead, so a proxy/CDN/edge layer
  // that keeps returning an unrelated 429 (which this app cannot be the
  // source of, per server.js's explicit exemption) can no longer keep
  // the offline banner stuck forever.
  consecutiveUnexpectedPings = 0;
  return checkRawNetworkReachability();
}

// Reference-counted body scroll lock — used by any full-viewport overlay
// (remove-confirm dialog, token sort dropdown, etc.) so the page behind
// them cannot scroll while they're open. Reference-counted so scrolling
// is only re-enabled once every open overlay has been closed, even if
// two ever end up open in an overlapping sequence.
//
// Plain `overflow: hidden` on body is NOT enough on iOS Safari — touch
// drag gestures can still scroll the page behind a fixed-position overlay
// even with overflow hidden set. The reliable cross-browser fix is to
// pin body in place at its current scroll offset with position: fixed,
// then restore the exact scroll position when unlocking.
let scrollLockCount = 0;
let scrollLockSavedY = 0;

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    scrollLockSavedY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollLockSavedY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  scrollLockCount++;
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockSavedY);
  }
}

function revealCard(cardEl) {
  if (!cardEl) return;
  cardEl.classList.remove('card-reveal');
  void cardEl.offsetWidth;
  cardEl.classList.add('card-reveal');
}

function formatUSD(value) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTokenAmountShort(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '0.0000';

  const units = [
    { divisor: 1e12, suffix: 'T' },
    { divisor: 1e9, suffix: 'B' },
    { divisor: 1e6, suffix: 'M' },
    { divisor: 1e3, suffix: 'K' },
  ];

  for (let i = 0; i < units.length; i++) {
    const { divisor, suffix } = units[i];
    if (n >= divisor) {
      const rounded = Number((n / divisor).toFixed(2));
      if (rounded >= 1000 && i > 0) {
        const upper = units[i - 1];
        return (n / upper.divisor).toFixed(2) + upper.suffix;
      }
      return rounded.toFixed(2) + suffix;
    }
  }

  return n.toFixed(4);
}

function formatSOL(value) {
  if (value === null || value === undefined || isNaN(value)) return '0 SOL';
  return `${parseFloat(value).toFixed(4)} SOL`;
}

function truncateAddress(address) {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address.trim());
}

function formatTxDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (txDay.getTime() === today.getTime()) return 'Today';
  if (txDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Formats wallet age from the single genesis timestamp returned by the
// dedicated /api/wallet-age endpoint. Deliberately NOT derived from the
// transactions list (allTransactions) — that list is capped at the most
// recent 100 entries, so for an active wallet its oldest entry is almost
// never the wallet's true first transaction (see fetchWalletAge).
function formatWalletAge(firstTransactionTimestamp) {
  if (firstTransactionTimestamp == null) return null;
  const oldest = Number(firstTransactionTimestamp);
  if (!Number.isFinite(oldest) || oldest <= 0) return null;
  const diffDays = Math.floor((Date.now() / 1000 - oldest) / 86400);
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  if (years > 0 && months > 0) return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  return `${days} day${days > 1 ? 's' : ''}`;
}

function getTokenColor(symbol) {
  return TOKEN_COLORS[symbol?.toUpperCase()] || TOKEN_COLORS.DEFAULT;
}

// Deterministic color for tokens outside the static brand map — same mint always gets the same color
function hashMintToColor(mint) {
  let hash = 0;
  for (let i = 0; i < mint.length; i++) {
    hash = mint.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 60%)`;
}

function getTokenColorSafe(token) {
  const staticColor = TOKEN_COLORS[token.symbol?.toUpperCase()];
  return staticColor && staticColor !== TOKEN_COLORS.DEFAULT
    ? staticColor
    : hashMintToColor(token.mint);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

const copyResetTimers = new WeakMap();

function showCopySuccess(btn, originalHTML) {
  clearTimeout(copyResetTimers.get(btn)); // cancel any pending revert from a prior rapid tap on THIS button
  btn.innerHTML = '<i class="fa-solid fa-check"></i>';
  btn.classList.add('copied');
  const resetTimer = setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.classList.remove('copied');
    copyResetTimers.delete(btn);
  }, CONFIG.COPY_RESET_DELAY);
  copyResetTimers.set(btn, resetTimer);
}

function hideAllMessages() {
  hide(errorMsg);
  hide(networkErrorMsg);
  hide(emptySearchMsg);
}

const LOCKOUT_STATE_STORAGE_KEY = 'IchniteLockoutState';
const LEGACY_RATE_LIMIT_STATE_STORAGE_KEY = 'IchniteRateLimitState';

function readLockoutStateFromStorage(storage) {
  try {
    if (!storage) return null;

    const raw = storage.getItem(LOCKOUT_STATE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const lockoutResetAt = Number(parsed?.lockoutResetAt);
    const lockoutKind = typeof parsed?.lockoutKind === 'string' ? parsed.lockoutKind : null;

    if (!Number.isFinite(lockoutResetAt)) {
      storage.removeItem(LOCKOUT_STATE_STORAGE_KEY);
      return null;
    }

    if (lockoutResetAt <= Date.now()) {
      storage.removeItem(LOCKOUT_STATE_STORAGE_KEY);
      return null;
    }

    return {
      rateLimited: true,
      lockoutResetAt,
      lockoutKind,
    };
  } catch {
    return null;
  }
}

function readPersistedRateLimitState() {
  const candidates = [
    readLockoutStateFromStorage(sessionStorage),
    readLockoutStateFromStorage(localStorage),
  ].filter(Boolean);

  if (candidates.length === 0) return null;

  return candidates.reduce((latest, current) => (
    current.lockoutResetAt > latest.lockoutResetAt ? current : latest
  ));
}

function persistRateLimitState(lockoutResetAt, lockoutKind = null) {
  try {
    if (!Number.isFinite(lockoutResetAt)) return;
    const payload = JSON.stringify({ lockoutResetAt, lockoutKind });

    sessionStorage.setItem(LOCKOUT_STATE_STORAGE_KEY, payload);
    localStorage.setItem(LOCKOUT_STATE_STORAGE_KEY, payload);
  } catch {
    // silent fail
  }
}

function clearPersistedRateLimitState() {
  try {
    sessionStorage.removeItem(LOCKOUT_STATE_STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_RATE_LIMIT_STATE_STORAGE_KEY);
  } catch {
    // silent fail
  }

  try {
    localStorage.removeItem(LOCKOUT_STATE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_RATE_LIMIT_STATE_STORAGE_KEY);
  } catch {
    // silent fail
  }
}

function hasValidLockoutResetAt(info = {}) {
  const lockoutResetAt = Number(info?.lockoutResetAt);
  return Number.isFinite(lockoutResetAt) && lockoutResetAt > Date.now();
}

function normalizeServerRateLimitInfo(info = {}) {
  const payload = typeof info === 'number'
    ? { rateLimited: true, retryAfterSeconds: info }
    : (info || {});

  const now = Date.now();
  const persisted = readPersistedRateLimitState();

  // Only an explicit lockoutResetAt may define the lockout expiration. A
  // generic resetAt can represent the normal request-window reset instead
  // (see server.js), and must never be silently reinterpreted as the
  // separate 15-minute lockout. This function never falls back to
  // client-persisted state to derive a lockoutResetAt — the server is the
  // sole authority for that value; if the current payload doesn't carry a
  // valid one, there is none, full stop.
  const lockoutResetAtValue = Number(payload.lockoutResetAt);
  const requestWindowResetAtValue = Number(payload.requestWindowResetAt);
  const remainingValue = Number(payload.remaining);

  let lockoutResetAt = null;

  if (
    payload.rateLimited &&
    Number.isFinite(lockoutResetAtValue) &&
    lockoutResetAtValue > now
  ) {
    lockoutResetAt = lockoutResetAtValue;
  }

  return {
    rateLimited: Boolean(payload.rateLimited || lockoutResetAt),
    remaining: Number.isFinite(remainingValue) ? remainingValue : null,
    requestWindowResetAt: Number.isFinite(requestWindowResetAtValue) ? requestWindowResetAtValue : null,
    lockoutResetAt,
    lockoutKind: payload.lockoutKind ?? payload.kind ?? persisted?.lockoutKind ?? null,
    retryAfterSeconds: lockoutResetAt
      ? Math.max(0, Math.ceil((lockoutResetAt - now) / 1000))
      : 0,
  };
}

function enterServerRateLimitState(info = {}) {
  const normalized = normalizeServerRateLimitInfo(info);
  if (!normalized.lockoutResetAt) return false;

  startRateLimitCountdown({
    ...normalized,
    lockoutKind: normalized.lockoutKind || 'server',
  });
  showRateLimitBlockedState({ showResults: Boolean(currentWalletAddress) });
  return true;
}

function getLiveUpdateRequestCost() {
  return allTokens.length > 0 ? 2 : 1;
}

function clearRateLimitCountdownState({ hideMessage = true, clearStorage = false } = {}) {
  if (rateLimitTickInterval) {
    clearInterval(rateLimitTickInterval);
    rateLimitTickInterval = null;
  }

  rateLimitedUntil = null;
  rateLimitStateKind = null;
  lastRateLimitInfo = null;
  lastSearchTime = 0;

  if (clearStorage) {
    clearPersistedRateLimitState();
  }

  searchBtn.disabled = false;
  searchBtn.classList.remove('loading');
  searchBtn.innerHTML = 'Trace';
    setRecentAddressesBusy(false);

  if (hideMessage) {
    hide(document.getElementById('rateLimitMsg'));
  }
}

function startRateLimitCountdown(info = {}) {
  const normalized = normalizeServerRateLimitInfo(info);
  const lockoutResetAt = Number(normalized.lockoutResetAt);
  const msgEl = document.getElementById('rateLimitMsg');
  if (!msgEl || !Number.isFinite(lockoutResetAt)) return;

  const now = Date.now();
  if (lockoutResetAt <= now) {
    clearRateLimitCountdownState({ clearStorage: true });
    return;
  }

  const currentUntil = Number(rateLimitedUntil);
  const currentActive = Number.isFinite(currentUntil) && currentUntil > now;

  if (currentActive && currentUntil >= lockoutResetAt && rateLimitTickInterval) {
    searchBtn.disabled = true;
    searchBtn.classList.remove('loading');
    searchBtn.innerHTML = 'Trace';
    show(msgEl);
    return;
  }

  if (rateLimitTickInterval) {
    clearInterval(rateLimitTickInterval);
    rateLimitTickInterval = null;
  }

  rateLimitedUntil = lockoutResetAt;
  rateLimitStateKind = normalized.lockoutKind || null;
  lastRateLimitInfo = normalized;
  lastSearchTime = 0;

  persistRateLimitState(lockoutResetAt, rateLimitStateKind);

  searchBtn.disabled = true;
  searchBtn.classList.remove('loading');
  searchBtn.innerHTML = 'Trace';
  hideAllMessages();
  show(msgEl);

  const tick = () => {
    const remainingMs = Math.max(0, lockoutResetAt - Date.now());
    const remaining = Math.ceil(remainingMs / 1000);

    if (remaining <= 0) {
      msgEl.textContent = `You've reached your limit. Please try again in 0:00`;
      clearRateLimitCountdownState({ clearStorage: true });
      return;
    }

    const m = Math.floor(remaining / 60);
    const s = String(remaining % 60).padStart(2, '0');
    msgEl.textContent = `You've reached your limit. Please try again in ${m}:${s}`;
  };

  tick();
  rateLimitTickInterval = setInterval(tick, 1000);
}

async function restorePersistedRateLimitCountdown() {
  const persisted = readPersistedRateLimitState();
  if (persisted) {
    startRateLimitCountdown(persisted);
  }

  await checkRateLimitGate();
}

async function restorePersistedRateLimitCountdownOnce() {
  if (!rateLimitRestoreInFlight) {
    rateLimitRestoreInFlight = (async () => {
      try {
        return await restorePersistedRateLimitCountdown();
      } finally {
        rateLimitRestoreInFlight = null;
      }
    })();
  }

  return rateLimitRestoreInFlight;
}

async function restorePersistedRateLimitCountdownIfNeeded() {
  const persisted = readPersistedRateLimitState();
  if (!persisted) return false;

  await restorePersistedRateLimitCountdownOnce();
  return true;
}

function showRateLimitBlockedState({ showResults = Boolean(currentWalletAddress) } = {}) {
  hideAllMessages();

  // Stop any in-flight / background work tied to the current search.
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  if (liveUpdateInterval) {
    clearInterval(liveUpdateInterval);
    liveUpdateInterval = null;
  }
  
    if (liveUpdateAbortController) {
    liveUpdateAbortController.abort();
    liveUpdateAbortController = null;
  }

  searchBtn.disabled = true;
  searchBtn.classList.remove('loading');
  searchBtn.innerHTML = 'Trace';

  const marketSection = document.getElementById('solMarketSection');
  const marketUnavailable = document.getElementById('solMarketUnavailable');
  const walletAgeRow = document.getElementById('walletAgeRow');
  const chartWrapper = barChart.closest('.chart-scroll-wrapper');

  if (showResults) {
    show(resultsSection);
    show(walletDisplay);
    show(clearBtn);
    show(totalNetWorth);
  } else {
    hide(resultsSection);
    hide(walletDisplay);
    hide(clearBtn);
    hide(totalNetWorth);
  }

  document.getElementById('netWorthError')?.remove();
  document.getElementById('netWorthEmpty')?.remove();
  document.getElementById('netWorthPending')?.remove();
  document.getElementById('solBalanceError')?.remove();
  document.getElementById('solCardFullError')?.remove();
  document.getElementById('barChartError')?.remove();
  document.getElementById('barChartEmpty')?.remove();

  removePieHiddenIndicators();

  solFetchFailed = true;
  tokenFetchFailed = true;
  barDataAvailable = false;
  resetBarToggleState();
  tokenDataAvailable = false;
  netWorthRevealed = false;
  tokenCardRevealed = false;
  barCardRevealed = false;
  solCardRevealed = false;
  solBalanceFailed = true;
  solPriceFailed = true;
  solAgeFailed = true;
  currentSolBalance = 0;
  currentSolPrice = 0;
  allTokens = [];
  allChartTransactions = [];
  allRecentTransactions = [];

  netWorthValue.textContent = '';
  hide(netWorthSkeleton);
  show(netWorthLabel);
  hide(netWorthValue);

  const netWorthMsg = document.createElement('p');
  netWorthMsg.id = 'netWorthError';
  netWorthMsg.className = 'empty-msg';
  netWorthMsg.textContent = 'Temporarily unavailable';
  totalNetWorth.appendChild(netWorthMsg);

  hide(solSkeleton);
  hide(document.getElementById('marketSkeleton'));
  hide(solBalanceRow);
  hide(document.getElementById('solEmptyMsg'));
  document.getElementById('solBalanceError')?.remove();
  solBalanceEl.textContent = '';
  solBalanceUsd.textContent = '';

  const solErrorMsg = document.createElement('p');
  solErrorMsg.id = 'solBalanceError';
  solErrorMsg.className = 'empty-msg';
  solErrorMsg.textContent = 'Temporarily unavailable';
  solBalanceRow.insertAdjacentElement('afterend', solErrorMsg);

  if (marketUnavailable) {
    marketUnavailable.textContent = 'Temporarily unavailable';
  }
  hide(document.getElementById('solMarketPriceRow'));
  hide(document.getElementById('solMarketChangeRow'));
  if (showResults) {
    show(marketSection);
    show(marketUnavailable);
  } else {
    hide(marketSection);
    hide(marketUnavailable);
  }

  hide(solBalanceUsd);
  solPriceEl.textContent = '';
  solPriceChange.textContent = '';
  solPriceChange.className = 'sol-change';

  walletAgeEl.textContent = 'Temporarily unavailable';
  hide(document.getElementById('walletAgeSkeleton'));
  if (showResults) {
    show(document.getElementById('walletAgeSection'));
    show(walletAgeRow);
  } else {
    hide(document.getElementById('walletAgeSection'));
    hide(walletAgeRow);
  }

  hide(tokenSkeleton);
  hide(tokenTotalSkeleton);
  hide(tokenTotalValue);
  hide(document.getElementById('tokenScrollFade'));
  document.getElementById('pieLegendCustom')?.replaceChildren();
  tokenTotalValue.textContent = '';

  hide(pieSkeleton);
  hide(pieSpinner);
  hide(pieChart);

  const tokenMsg = document.createElement('p');
  tokenMsg.className = 'empty-msg';
  tokenMsg.textContent = 'Temporarily unavailable';
  tokenList.replaceChildren(tokenMsg);
  if (showResults) {
    show(tokenList);
  } else {
    hide(tokenList);
  }

  hide(nftSkeleton);
  nftCountBadge.textContent = '';
  hide(nftCountBadge);
  nftGrid.replaceChildren();

  const nftMsg = document.createElement('p');
  nftMsg.className = 'empty-msg';
  nftMsg.textContent = 'Temporarily unavailable';
  nftList.replaceChildren(nftMsg);
  if (showResults) {
    show(nftList);
    show(nftGrid);
  } else {
    hide(nftList);
    hide(nftGrid);
  }

  hide(barSkeleton);
  hide(barSpinner);
  hide(barChart);
  chartWrapper?.classList.remove('chart-reserved');
  document.getElementById('barChartError')?.remove();
  document.getElementById('barChartEmpty')?.remove();

  const barMsg = document.createElement('p');
  barMsg.id = 'barChartError';
  barMsg.className = 'empty-msg';
  barMsg.textContent = 'Temporarily unavailable';
  chartWrapper?.appendChild(barMsg);
  if (showResults) {
    show(chartWrapper);
  } else {
    hide(chartWrapper);
  }

  hide(txSkeleton);
  const txMsg = document.createElement('p');
  txMsg.className = 'empty-msg';
  txMsg.textContent = 'Temporarily unavailable';
  last7txList.replaceChildren(txMsg);
  if (showResults) {
    show(last7txList);
    hide(solscanLink);
    hide(seemore);
  } else {
    hide(last7txList);
    hide(solscanLink);
    hide(seemore);
  }
}

async function checkRateLimitGate(operationCost = null) {
  const persisted = readPersistedRateLimitState();

  try {
    const costQuery = Number.isFinite(operationCost) && operationCost > 0
      ? `?cost=${encodeURIComponent(operationCost)}`
      : '';
    const res = await fetch(`${API_BASE}/api/rate-limit-status${costQuery}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('Rate-limit status endpoint returned non-OK response:', res.status);
      if (persisted) {
        startRateLimitCountdown(persisted);
        return {
          rateLimited: true,
          checked: false,
          remaining: 0,
          retryAfterSeconds: persisted.retryAfterSeconds,
          lockoutResetAt: persisted.lockoutResetAt,
          requestWindowResetAt: null,
        };
      }

      return {
        rateLimited: false,
        checked: false,
        remaining: null,
        retryAfterSeconds: 0,
        lockoutResetAt: null,
        requestWindowResetAt: null,
      };
    }

    const data = await res.json().catch(() => null);

    if (!data || typeof data !== 'object') {
      console.warn('Rate-limit status endpoint returned invalid JSON');
      if (persisted) {
        startRateLimitCountdown(persisted);
        return {
          rateLimited: true,
          checked: false,
          remaining: 0,
          retryAfterSeconds: persisted.retryAfterSeconds,
          lockoutResetAt: persisted.lockoutResetAt,
          requestWindowResetAt: null,
        };
      }

      return {
        rateLimited: false,
        checked: false,
        remaining: null,
        retryAfterSeconds: 0,
        lockoutResetAt: null,
        requestWindowResetAt: null,
      };
    }

    const normalized = normalizeServerRateLimitInfo(data);
    
    if (Number.isFinite(data.serverTime)) {
      const skewMs = Date.now() - data.serverTime;
      console.log(
        `⏱ Clock skew (browser - server): ${skewMs}ms (${(skewMs / 1000).toFixed(1)}s). ` +
        `Positive = browser clock is AHEAD of server.`
      );
    }

    if (normalized.lockoutResetAt) {
      startRateLimitCountdown(normalized);
      return {
        rateLimited: true,
        checked: true,
        remaining: normalized.remaining,
        retryAfterSeconds: normalized.retryAfterSeconds,
        lockoutResetAt: normalized.lockoutResetAt,
        requestWindowResetAt: normalized.requestWindowResetAt,
      };
    }

    if (persisted) {
      startRateLimitCountdown(persisted);
      return {
        rateLimited: true,
        checked: true,
        remaining: 0,
        retryAfterSeconds: persisted.retryAfterSeconds,
        lockoutResetAt: persisted.lockoutResetAt,
        requestWindowResetAt: normalized.requestWindowResetAt ?? null,
      };
    }

    clearPersistedRateLimitState();

    return {
      rateLimited: false,
      checked: true,
      remaining: Number.isFinite(normalized.remaining) ? normalized.remaining : null,
      retryAfterSeconds: Number.isFinite(normalized.retryAfterSeconds) ? normalized.retryAfterSeconds : 0,
      lockoutResetAt: null,
      requestWindowResetAt: normalized.requestWindowResetAt ?? null,
    };
  } catch (error) {
    console.warn('Rate-limit status check failed:', error);
    if (persisted) {
      startRateLimitCountdown(persisted);
      return {
        rateLimited: true,
        checked: false,
        remaining: 0,
        retryAfterSeconds: persisted.retryAfterSeconds,
        lockoutResetAt: persisted.lockoutResetAt,
        requestWindowResetAt: null,
        error,
      };
    }

    return {
      rateLimited: false,
      checked: false,
      remaining: null,
      retryAfterSeconds: 0,
      lockoutResetAt: null,
      requestWindowResetAt: null,
      error,
    };
  }
}

// Differentiate offline and server errors
function showError(type, customMessage) {
  hideAllMessages();
  if (type === 'empty') {
    show(emptySearchMsg);
  } else if (type === 'invalid') {
    show(errorMsg);
  } else if (type === 'offline') {
    networkErrorMsg.textContent = 'You are offline. Please check your connection.';
    show(networkErrorMsg);
  } else if (type === 'server') {
    networkErrorMsg.textContent = 'Ichnite server is having issues. Please try again shortly.';
    show(networkErrorMsg);
  } else if (type === 'ratelimit') {
    networkErrorMsg.textContent = 'Too many requests. Please wait a moment.';
    show(networkErrorMsg);
  } else if (type === 'solana-delay') {
    networkErrorMsg.textContent = customMessage || 'Solana network is experiencing delays. Please try again shortly.';
    show(networkErrorMsg);
  } else if (type === 'invalid-address') {
    networkErrorMsg.textContent = customMessage || 'Wallet not found - Invalid Solana Address';
    show(networkErrorMsg);
  } else if (customMessage) {
    networkErrorMsg.textContent = customMessage;
    show(networkErrorMsg);
  }
}

//Parse response status to show correct error
// Single source of truth for classifying a failed backend response into
// 'notfound' | 'solana-delay' | 'server'. Reads the backend's explicit
// errorType/headline fields ONLY — never infers a type from substring-
// matching the human-readable `error` text, so a generic 503/exception can
// never be misclassified as a genuine Solana delay or a not-found condition.
function classifyBackendErrorResponse(body) {
  const backendType = typeof body?.errorType === 'string' ? body.errorType.toLowerCase() : null;
  return backendType === 'solana-delay' ? 'solana-delay' : 'server';
}

async function handleResponse(response) {
  if (response.ok) return response.json();

  const body = await response.json().catch(() => null);

      if (response.status === 429) {
  if (hasValidLockoutResetAt(body)) {
    enterServerRateLimitState(body);
    throw { type: 'ratelimit' };
  }

  // An anomalous data-endpoint 429 has no authoritative lockout timestamp.
  // Treat it as a server failure for the affected card; do not invent a
  // client lockout or suppress final per-card aggregation.
  throw { type: 'server' };
}

  if (response.status === 400) {
    hardFailureOverrideActive = true;
    showError('invalid-address', 'Wallet not found - Invalid Solana Address');
    throw { type: 'invalid-address' };
  }

  throw { type: classifyBackendErrorResponse(body) };
}

async function reportBackendErrorType(response, cardKey) {
  if (rateLimitedUntil || hardFailureOverrideActive) return;

  if (!response) {
    recordCardFailure(cardKey, 'server');
    return;
  }

  if (response.status === 400) {
    hardFailureOverrideActive = true;
    showError('invalid-address', 'Wallet not found - Invalid Solana Address');
    return;
  }

  const body = await response.json().catch(() => null);

  if (rateLimitedUntil || hardFailureOverrideActive) return;

  if (response.status === 429) {
    if (hasValidLockoutResetAt(body)) {
      enterServerRateLimitState(body);
      return;
    }

    // Data-endpoint 429 without an authoritative lockout timestamp:
    // treat it as a server/card failure rather than creating a client lockout.
    recordCardFailure(cardKey, 'server');
    return;
  }

  recordCardFailure(cardKey, classifyBackendErrorResponse(body));
}

const CARD_SLOTS = ['solBalance', 'market', 'tokens', 'nfts', 'chart', 'recent', 'age'];
const CARD_SLOT_ELEMENT_IDS = {
  solBalance: 'solBalanceError',
  market: 'solMarketUnavailable',
  age: 'walletAge',
  tokens: 'tokenListError',
  nfts: 'nftListError',
  chart: 'barChartError',
  recent: 'recentTxError',
};
const FAILURE_REASON_LABEL = {
  'solana-delay': 'Solana delay',
  server: 'server error',
};
const FAILURE_BANNER_TEXT = {
  'solana-delay': 'Solana network is experiencing delays. Please try again shortly.',
  server: 'Ichnite server is having issues. Please try again shortly.',
};

function recordCardFailure(cardKey, type) {
  cardFailureOutcomes[cardKey] = type;
}

function finalizeCardFailures() {
  if (hardFailureOverrideActive || rateLimitedUntil) return;

  const failedKeys = Object.keys(cardFailureOutcomes);
  if (failedKeys.length === 0) return;

  const allFailed = failedKeys.length === CARD_SLOTS.length;
  const allSameType = allFailed && failedKeys.every(
    (key) => cardFailureOutcomes[key] === cardFailureOutcomes[failedKeys[0]]
  );

  if (allSameType) {
    const type = cardFailureOutcomes[failedKeys[0]];
    showError(type, FAILURE_BANNER_TEXT[type]);
    return;
  }

  for (const key of failedKeys) {
    const type = cardFailureOutcomes[key];
    const label = FAILURE_REASON_LABEL[type];
    const el = document.getElementById(CARD_SLOT_ELEMENT_IDS[key]);
    if (el && label) {
      el.textContent = `${el.textContent} - ${label}`;
    }
  }
}

function resetInputState() {
  walletInput.classList.remove('input-valid', 'input-error');
}

// ════════════════════════════════════════
// ── 9. SEARCH HISTORY ──
// ════════════════════════════════════════

function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('IchniteHistory') || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(address) {
  try {
    let history = getSearchHistory().filter(a => a !== address);
    history.unshift(address);
    history = history.slice(0, CONFIG.MAX_HISTORY);
    localStorage.setItem('IchniteHistory', JSON.stringify(history));
  } catch { /* silent fail */ }
}

function renderSearchHistory() {
  const history = getSearchHistory();
  if (history.length === 0) { hide(searchHistory); return; }
  historyChips.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'history-label';
  label.textContent = 'Recent:';
  historyChips.appendChild(label);
  history.forEach(address => {
    const wrap = document.createElement('span');
    wrap.className = 'history-chip-wrap';

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'history-chip';
    chip.textContent = truncateAddress(address);
    chip.title = address;
    chip.addEventListener('click', () => {
  if (currentAbortController || rateLimitedUntil) return;
  walletInput.value = address;
  handleSearch();
});
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        showRemoveConfirm(address);
      }
    });
    
    let pressTimer = null;
    chip.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => showRemoveConfirm(address), 250);
    });
    chip.addEventListener('touchend', () => clearTimeout(pressTimer));
    chip.addEventListener('touchmove', () => clearTimeout(pressTimer));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'history-chip-remove';
    removeBtn.setAttribute('aria-label', `Remove ${truncateAddress(address)} from history`);
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => showRemoveConfirm(address));

    wrap.appendChild(chip);
    wrap.appendChild(removeBtn);
    historyChips.appendChild(wrap);
  });
  show(searchHistory);
}


function showRemoveConfirm(addressToRemove) {
  const overlay = document.createElement('div');
  overlay.className = 'remove-confirm-overlay';

  const card = document.createElement('div');
  card.className = 'remove-confirm-card';

  const text = document.createElement('p');
  text.className = 'remove-confirm-text';
  text.textContent = `Remove ${truncateAddress(addressToRemove)} from Recent Addresses?`;

  const closeRemoveConfirm = () => {
    overlay.remove();
    unlockBodyScroll();
  };

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-confirm-btn';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    let history = getSearchHistory().filter(a => a !== addressToRemove);
    localStorage.setItem('IchniteHistory', JSON.stringify(history));
    renderSearchHistory();
    closeRemoveConfirm();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'remove-confirm-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', closeRemoveConfirm);

  card.appendChild(text);
  card.appendChild(removeBtn);
  card.appendChild(cancelBtn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  lockBodyScroll();
}

// ════════════════════════════════════════
// ── 10. SKELETON MANAGEMENT ──
// ════════════════════════════════════════

function showAllSkeletons() {
  infoAccordions.forEach(el => hide(el));
  show(resultsSection);
  clearRuntimeMessageNodes();
  show(totalNetWorth);
  show(netWorthSkeleton);
  show(netWorthLabel);
  hide(netWorthValue);
  show(solSkeleton);
  show(document.getElementById('marketSkeleton'));
  hide(document.getElementById('solMarketSection'));
  show(document.getElementById('walletAgeSection'));
  show(document.getElementById('walletAgeSkeleton'));
  hide(document.getElementById('walletAgeRow'));
    document.getElementById('solMarketUnavailable').textContent = 'Market unavailable';
  hide(solBalanceRow);
  hide(document.getElementById('solEmptyMsg'));
  clearRuntimeMessageNodes();
  show(tokenSkeleton);
  show(tokenTotalSkeleton);
  hide(tokenList);
  hide(tokenTotalValue);
  hide(document.getElementById('tokenScrollFade'));
  hiddenTokenIds.clear();
  removePieHiddenIndicators();
  document.getElementById('pieLegendCustom')?.replaceChildren();
  show(pieSkeleton);
  hide(pieSpinner);
  hide(pieChart);
  show(nftSkeleton);
  hide(nftList);
  hide(nftGrid);
  hide(nftCountBadge);
  barChart.closest('.chart-scroll-wrapper')?.classList.add('chart-reserved');
  show(barSkeleton);
  hide(barSpinner);
  hide(barChart);
  clearRuntimeMessageNodes();
  show(txSkeleton);
  hide(last7txList);
  hide(solscanLink);
  hide(seemore);
}

function hideSkeletonShowContent(skeletonEl, ...contentEls) {
  hide(skeletonEl);
  contentEls.forEach(el => show(el));
}

// ════════════════════════════════════════
// ── 11. SEARCH BUTTON STATE ──
// ════════════════════════════════════════

function setSearchLoading(isLoading) {
  setRecentAddressesBusy(isLoading);

  if (isLoading) {
    searchBtn.disabled = true;
    searchBtn.classList.add('loading');
    searchBtn.innerHTML = '<span class="btn-spinner"></span> Tracing...';
  } else {
    searchBtn.disabled = false;
    searchBtn.classList.remove('loading');
    searchBtn.innerHTML = 'Trace';
  }
}

function setRecentAddressesBusy(isBusy) {
  historyChips?.querySelectorAll('.history-chip').forEach((chip) => {
    const busy = Boolean(isBusy);
    chip.classList.toggle('busy', busy);
    chip.setAttribute('aria-disabled', String(busy));
  });
}

// ════════════════════════════════════════
// ── 12. CLEAR / RESET ──
// ════════════════════════════════════════

function resetBarToggleState() {
  toggleBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.style.transform = '';
    btn.setAttribute('aria-pressed', 'false');
  });
  const daysToggleBtn = document.querySelector('[data-range="days"]');
  daysToggleBtn?.classList.add('active');
  daysToggleBtn?.setAttribute('aria-pressed', 'true');
  hide(yearDropdown);
  currentBarRange = 'days';
  currentYearSelection = 1;
  yearRangeActive = false;
  if (yearToggleBtn) yearToggleBtn.textContent = 'Year';
  yearOptions.forEach(opt => {
    opt.classList.remove('selected');
    opt.setAttribute('aria-pressed', 'false');
  });
}

function resetAll() {
  // Abort any in-flight requests
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  clearTimeout(inputValidTimeout);
  walletInput.value = '';
  resetInputState();
  currentWalletAddress = '';
  currentSolPrice = 0;
  currentSolBalance = 0;
  allTokens = [];
  allChartTransactions = [];
  allRecentTransactions = [];
  hideAllMessages();
  hide(resultsSection);
  hide(walletDisplay);
  hide(clearBtn);
  hide(totalNetWorth);
  setRecentAddressesBusy(false);
  clearRuntimeMessageNodes();
removePieHiddenIndicators();
  if (tokenSearch) tokenSearch.value = '';
  infoAccordions.forEach(el => show(el));
  infoAccordions.forEach(el => {
    const content = el.querySelector('.accordion-content');
    const arrow = el.querySelector('.arrow');
    hide(content);
    arrow?.classList.remove('open');
  });
  renderSearchHistory();
  if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null; }
  hiddenTokenIds.clear();
  removePieHiddenIndicators();
  if (barChartInstance) { barChartInstance.destroy(); barChartInstance = null; }
      if (liveUpdateInterval) { clearInterval(liveUpdateInterval); liveUpdateInterval = null; }
    if (liveUpdateAbortController) {
    liveUpdateAbortController.abort();
    liveUpdateAbortController = null;
  }

  clearRateLimitCountdownState({ hideMessage: true, clearStorage: false });
  document.title = 'Ichnite';
    void restorePersistedRateLimitCountdownIfNeeded();
  resetBarToggleState();
  setFeedbackPageType('landing');
  walletInput.focus();
}

// ════════════════════════════════════════
// ── 13. INPUT VALIDATION ──
// ════════════════════════════════════════

walletInput.addEventListener('input', () => {
  if (walletInput.value.length > CONFIG.MAX_ADDRESS_LENGTH) {
    walletInput.value = walletInput.value.slice(0, CONFIG.MAX_ADDRESS_LENGTH);
  }

  clearTimeout(inputValidTimeout);
  inputValidTimeout = null;
  walletInput.classList.remove('input-valid');

  resetInputState();

  if (navigator.onLine) {
    hideAllMessages();
  }
});

walletInput.addEventListener('focus', () => {
  clearTimeout(inputValidTimeout);
  inputValidTimeout = null;
  walletInput.classList.remove('input-valid');
});

// ════════════════════════════════════════
// ── 14. MAIN SEARCH HANDLER ──
// ════════════════════════════════════════

async function handleSearch() {
  if (currentAbortController) {
    return; // a search is already in flight
  }

  if (rateLimitedUntil) {
    return; // countdown already owns the disabled state
  }

  if (!navigator.onLine) {
    const actuallyOnline = await verifyRealConnectivity();
    if (!actuallyOnline) {
      showError('offline');
      return;
    }
  }

  const rawAddress = walletInput.value.trim();

  if (!rawAddress) {
    hideAllMessages();
    showError('empty');
    walletInput.classList.add('input-error');
    return;
  }

  const now = Date.now();
  if (now - lastSearchTime < CONFIG.RATE_LIMIT_MS) {
    showError('ratelimit');
    return;
  }

  if (!isValidSolanaAddress(rawAddress)) {
    hideAllMessages();
    showError('invalid');
    walletInput.classList.add('input-error');
    walletInput.classList.remove('input-valid');
    return;
  }

  const existingResultsVisible = Boolean(currentWalletAddress);

  currentAbortController = new AbortController();
const searchController = currentAbortController;

setSearchLoading(true);

  // Cost is passed to the backend so it can authoritatively decide whether the
// remaining budget covers a full Trace search. Reserve the worst case (8, not
// the base 7) because chart + recent are separate calls and recent may still
// need token-metadata for the displayed rows.
const rateLimitCheck = await checkRateLimitGate(CONFIG.TRACE_REQUEST_COST_MAX);

  if (searchController !== currentAbortController || searchController.signal.aborted) {
    return;
  }

  if (rateLimitCheck.rateLimited) {
    setSearchLoading(false);
    currentAbortController = null;
    if (hasValidLockoutResetAt(rateLimitCheck)) {
      enterServerRateLimitState(rateLimitCheck);
    } else {
      showError('server');
    }
    return;
  }

  lastSearchTime = now;
  currentWalletAddress = rawAddress;
  walletInput.classList.add('input-valid');
  walletInput.classList.remove('input-error');
  hideAllMessages();

  clearTimeout(inputValidTimeout);
  inputValidTimeout = setTimeout(() => {
    walletInput.classList.remove('input-valid');
  }, 5000);

  setFeedbackPageType('results');
  showAllSkeletons();
  if (tokenSearch) tokenSearch.value = '';

  document.title = `Wallet Results - ${currentWalletAddress}`;
  truncatedAddressEl.textContent = truncateAddress(currentWalletAddress);
  show(walletDisplay);
  show(clearBtn);
  solscanLink.href = `https://solscan.io/account/${currentWalletAddress}`;
  saveToHistory(currentWalletAddress);
  hide(searchHistory);
  walletInput.blur();

  if (liveUpdateInterval) {
    clearInterval(liveUpdateInterval);
    liveUpdateInterval = null;
  }
  
  if (liveUpdateAbortController) {
    liveUpdateAbortController.abort();
    liveUpdateAbortController = null;
  }

  try {
    solFetchFailed = false;
    tokenFetchFailed = false;
    barDataAvailable = false;
    resetBarToggleState();
    tokenDataAvailable = false;
    netWorthRevealed = false;
    tokenCardRevealed = false;
    barCardRevealed = false;
    solCardRevealed = false;
    solBalanceFailed = false;
    solPriceFailed = false;
    solAgeFailed = false;
    failedFetchCount = 0;
    cardFailureOutcomes = {};
    hardFailureOverrideActive = false;
    lastRateLimitInfo = null;

            await Promise.allSettled([
  fetchSolBalance(currentWalletAddress),
  fetchTokens(currentWalletAddress),
  fetchNFTs(currentWalletAddress),
  fetchWalletActivityChart(currentWalletAddress),
  fetchRecentTransactions(currentWalletAddress),
  fetchWalletAge(currentWalletAddress),
]);

    if (searchController !== currentAbortController || searchController.signal.aborted) {
      return;
    }

    if (!rateLimitedUntil) {
      updateNetWorth();
    }
    
        finalizeCardFailures();
  } finally {
  if (currentAbortController === searchController) {
    if (!rateLimitedUntil) {
      setSearchLoading(false);
    } else {
      searchBtn.disabled = true;
      searchBtn.classList.remove('loading');
      searchBtn.innerHTML = 'Trace';
    }
    currentAbortController = null;
  }
}

  if (!rateLimitedUntil) {
    liveUpdateInterval = setInterval(() => {
      if (currentWalletAddress) fetchLivePrices();
    }, CONFIG.LIVE_UPDATE_INTERVAL);
  }
}

// ════════════════════════════════════════
// ── 15. SOL BALANCE ──
// ════════════════════════════════════════

async function fetchSolBalance(address) {
  removeAllById('solBalanceError');
  removeAllById('solPriceError');
  removeAllById('solCardFullError');
  const signal = currentAbortController?.signal;

  const [priceResult, balanceResult] = await Promise.allSettled([
  scheduleTraceRequest(
    () => fetch(`${API_BASE}/api/sol-price`, { signal }),
    signal,
  ),
  scheduleTraceRequest(
    () => fetch(`${API_BASE}/api/sol-balance?address=${address}`, { signal }),
    signal,
  ),
]);

  if (signal?.aborted) return;

  const priceResponse = priceResult.status === 'fulfilled' ? priceResult.value : null;
  const balanceResponse = balanceResult.status === 'fulfilled' ? balanceResult.value : null;

  hide(solSkeleton);
  hide(document.getElementById('marketSkeleton'));

  if (priceResponse?.status === 429 || balanceResponse?.status === 429) {
    const rateLimitBody = priceResponse?.status === 429
      ? await priceResponse.json().catch(() => ({}))
      : await balanceResponse.json().catch(() => ({}));

    if (hasValidLockoutResetAt(rateLimitBody)) {
      enterServerRateLimitState(rateLimitBody);
      return;
    }

    hardFailureOverrideActive = true;
    showError('server');

    solBalanceFailed = true;
    solPriceFailed = true;
    solFetchFailed = true;
    failedFetchCount++;

    hide(solBalanceRow);
    hide(document.getElementById('solEmptyMsg'));

    const err = document.createElement('p');
    err.id = 'solBalanceError';
    err.className = 'empty-msg';
    err.setAttribute('role', 'status');
    err.setAttribute('aria-live', 'polite');
    err.textContent = 'Unable to load SOL balance';
    solBalanceRow.insertAdjacentElement('afterend', err);

    show(document.getElementById('solMarketSection'));
    hide(document.getElementById('solMarketPriceRow'));
    hide(document.getElementById('solMarketChangeRow'));
    show(document.getElementById('solMarketUnavailable'));
    hide(solBalanceUsd);

    if (!solCardRevealed) {
      revealCard(solBalanceRow.closest('.card'));
      solCardRevealed = true;
    }
    return;
  }

  const priceUnreachable = priceResult.status === 'rejected';
  const balanceUnreachable = balanceResult.status === 'rejected';

  // Both requests failed at the NETWORK level — backend itself is unreachable.
  // Treat as one full-card failure, skip all per-section granularity entirely.
  if (priceUnreachable && balanceUnreachable) {
    solBalanceFailed = true;
    solPriceFailed = true;
    solFetchFailed = true; // legacy flag — still read by updateNetWorth()
    failedFetchCount++;

    hide(solBalanceRow);
    hide(document.getElementById('solEmptyMsg'));

    const err = document.createElement('p');
    err.id = 'solBalanceError';
    err.className = 'empty-msg';
    err.setAttribute('role', 'status');
    err.setAttribute('aria-live', 'polite');
    err.textContent = 'Unable to load SOL balance';
    solBalanceRow.insertAdjacentElement('afterend', err);

    // Market is owned by this same function's price handling below — show
    // it with its own placeholder instead of hiding it. Wallet Age is owned
    // exclusively by fetchWalletAge(), which runs independently in the same
    // Promise.allSettled batch in handleSearch() — never touch #walletAgeRow
    // here, or it races with that function's own correct handling of this
    // exact failure.
    show(document.getElementById('solMarketSection'));
    hide(document.getElementById('solMarketPriceRow'));
    hide(document.getElementById('solMarketChangeRow'));
    show(document.getElementById('solMarketUnavailable'));
    hide(solBalanceUsd);

    recordCardFailure('solBalance', 'server');
    recordCardFailure('market', 'server');
    if (!solCardRevealed) {
      revealCard(solBalanceRow.closest('.card'));
      solCardRevealed = true;
    }
    return;
  }

  if (signal?.aborted || rateLimitedUntil) return;

  // Past this point, the backend IS reachable — per-section logic applies.
  // solFetchFailed is computed at the END of this function, once both
  // sections have actually been evaluated — not forced false here.

  // ── Balance section ──
  if (balanceResponse && balanceResponse.ok) {
    const balanceData = await balanceResponse.json();
    if (signal?.aborted || rateLimitedUntil) return;

    currentSolBalance = balanceData.balance || 0;
    solBalanceFailed = false;

    if (currentSolBalance === 0) {
      hide(solBalanceRow);
      show(document.getElementById('solEmptyMsg'));
    } else {
      hide(document.getElementById('solEmptyMsg'));
      solBalanceEl.textContent = formatSOL(currentSolBalance);
      show(solBalanceRow);
    }
  } else {
    solBalanceFailed = true;
    currentSolBalance = 0;
    hide(solBalanceRow);
    hide(document.getElementById('solEmptyMsg'));
    hide(solBalanceUsd);
    const err = document.createElement('p');
    err.id = 'solBalanceError';
    err.className = 'empty-msg';
    err.setAttribute('role', 'status');
    err.setAttribute('aria-live', 'polite');
    err.textContent = 'Unable to load SOL balance';
    solBalanceRow.insertAdjacentElement('afterend', err);
    await reportBackendErrorType(balanceResponse, 'solBalance');
  }

  if (signal?.aborted || rateLimitedUntil) return;

  // ── Market section — one shared placeholder, not per-value ──
  show(document.getElementById('solMarketSection'));
  const marketPlaceholder = document.getElementById('solMarketUnavailable');
  const marketValuesRow1 = document.getElementById('solMarketPriceRow');
  const marketValuesRow2 = document.getElementById('solMarketChangeRow');

  if (priceResponse && priceResponse.ok) {
    const priceData = await priceResponse.json();
    if (signal?.aborted || rateLimitedUntil) return;

    currentSolPrice = priceData.price || 0;
    const change = priceData.change24h || 0;
    solPriceFailed = false;

    solPriceEl.textContent = formatUSD(currentSolPrice);
    const changeFormatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    solPriceChange.textContent = changeFormatted;
    solPriceChange.className = 'sol-change ' + (change >= 0 ? 'gain' : 'loss');
    hide(marketPlaceholder);
    show(marketValuesRow1);
    show(marketValuesRow2);

    if (currentSolBalance > 0) {
      solBalanceUsd.textContent = formatUSD(currentSolBalance * currentSolPrice);
      show(solBalanceUsd);
    } else {
      hide(solBalanceUsd);
    }
  } else {
    solPriceFailed = true;
    solPriceChange.className = 'sol-change';
    hide(marketValuesRow1);
    hide(marketValuesRow2);
    show(marketPlaceholder);
    hide(solBalanceUsd);
    await reportBackendErrorType(priceResponse, 'market');
  }

  if (!solCardRevealed) {
    revealCard(solBalanceRow.closest('.card'));
    solCardRevealed = true;
  }
  solFetchFailed = solBalanceFailed && solPriceFailed;
}

// ════════════════════════════════════════
// ── 16. TOKEN HOLDINGS ──
// ════════════════════════════════════════

async function fetchTokens(address) {
  try {
    const signal = currentAbortController?.signal;
    const res = await scheduleTraceRequest(
  () => fetch(`${API_BASE}/api/tokens?address=${address}`, { signal }),
  signal,
);
    const data = await handleResponse(res);

    if (signal?.aborted || rateLimitedUntil) return;

    allTokens = data.tokens || [];
    primeClientTokenMetadataCache(allTokens);

    if (allTokens.length === 0) {
      tokenDataAvailable = false;
      hideSkeletonShowContent(tokenSkeleton, tokenList);
      hide(tokenTotalSkeleton);
      hide(pieSkeleton);
      hide(pieSpinner);
      const msg = document.createElement('p');
      msg.className = 'empty-msg';
      msg.textContent = 'This wallet has no tokens';
      tokenList.replaceChildren(msg);
      revealCard(tokenList.closest('.card'));
      return;
    }

    if (signal?.aborted || rateLimitedUntil) return;

    // Amounts, metadata, and prices all arrive together — no separate price fetch needed
    tokenDataAvailable = true;
    renderTokenList(allTokens, {});

  } catch (error) {
    if (error?.type === 'ratelimit' || error?.name === 'AbortError' || rateLimitedUntil) return;
    tokenFetchFailed = true;
    tokenDataAvailable = false;
    failedFetchCount++;
    recordCardFailure('tokens', error?.type || 'server');
    console.error('Token error:', error);
    hideSkeletonShowContent(tokenSkeleton, tokenList);
    hide(tokenTotalSkeleton);
    hide(pieSkeleton);
    const msg = document.createElement('p');
    msg.id = 'tokenListError';
    msg.className = 'empty-msg';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.textContent = 'Unable to load token holdings';
    tokenList.replaceChildren(msg);
  }
}

function getTokenUsdValue(token) {
  if (token.priceUnavailable || token.priceUsd === null || token.priceUsd === undefined) return 0;
  return (parseFloat(token.amount) || 0) * token.priceUsd;
}

function hasKnownPrice(token) {
  return !token.priceUnavailable && token.priceUsd !== null && token.priceUsd !== undefined;
}

// Shared row-builder — used by both full render and sort-only reorder
function buildTokenRowsFragment(sortedTokens) {
  const fragment = document.createDocumentFragment();

  sortedTokens.forEach(token => {
    const symbol = token.symbol || 'Unknown';
    const amount = parseFloat(token.amount || 0).toFixed(4);
    const usdValue = getTokenUsdValue(token);
    const color = getTokenColor(symbol);

    const row = document.createElement('div');
    row.className = 'token-row';

    const img = document.createElement('img');
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    img.dataset.src = token.logoURI || `${API_BASE}/api/token-logo-fallback`;
    img.alt = symbol;
    img.className = 'token-logo';
    img.loading = 'lazy';
    img.style.border = `2px solid ${color}`;
    img.onerror = () => {
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    };

    const infoCol = document.createElement('div');
    infoCol.className = 'token-info-col';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'token-name';
    nameSpan.textContent = symbol;

    const amountSpan = document.createElement('span');
    amountSpan.className = 'token-amount';
    amountSpan.textContent = amount;

    infoCol.appendChild(nameSpan);
    infoCol.appendChild(amountSpan);

    const valueSpan = document.createElement('span');
    valueSpan.className = 'token-value';
    valueSpan.textContent = token.priceUnavailable ? 'Unpriced' : formatUSD(usdValue);

    row.appendChild(img);
    row.appendChild(infoCol);
    row.appendChild(valueSpan);
    fragment.appendChild(row);
  });

  return fragment;
}

function sortTokens(tokens) {
  const sortBy = tokenSort?.dataset.value || 'value';
  return [...tokens].sort((a, b) => {
    if (sortBy === 'value') return getTokenUsdValue(b) - getTokenUsdValue(a);
    if (sortBy === 'amount') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'name') return (a.symbol || '').localeCompare(b.symbol || '');
    return 0;
  });
}

// Total value + pie chart always reflect the COMPLETE portfolio — never the filtered view
function updateTokenTotalsAndChart(tokens, options = {}) {
  hide(tokenTotalSkeleton);
  const sorted = sortTokens(tokens);
  const totalValue = sorted.reduce((sum, t) => sum + getTokenUsdValue(t), 0);

  const allUnpriced = sorted.length > 0 && sorted.every(t => t.priceUnavailable);
  tokenTotalValue.textContent = allUnpriced ? 'Value pending' : formatUSD(totalValue);
  tokenTotalValue.classList.toggle('is-pending', allUnpriced);

  show(tokenTotalValue);
  drawPieChart(sorted, totalValue, options);
  updateNetWorth();
}

// Single source of truth for what rows are displayed — always reads the CURRENT
// search query and sort selection live from the DOM, regardless of caller
// (initial load, live refresh, search typing, or sort change).
function renderVisibleTokenRows() {
  if (!tokenDataAvailable) return;

  const query = tokenSearch?.value.toLowerCase().trim();
  const filtered = query
    ? allTokens.filter(t => t.symbol?.toLowerCase().includes(query) || t.name?.toLowerCase().includes(query))
    : allTokens;

  const sorted = sortTokens(filtered);
  const prevScrollTop = tokenList.scrollTop;
  const fragment = buildTokenRowsFragment(sorted);
  tokenList.replaceChildren(fragment);
  tokenList.scrollTop = prevScrollTop;

  tokenList.querySelectorAll('img[data-src]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src;
  });

  const fadeEl = document.getElementById('tokenScrollFade');
  if (sorted.length > 5) {
    show(fadeEl);
  } else {
    hide(fadeEl);
  }

  hideSkeletonShowContent(tokenSkeleton, tokenList);
  if (!tokenCardRevealed) {
    revealCard(tokenList.closest('.card'));
    tokenCardRevealed = true;
  }
}

// Full render — used by initial fetch and live refresh. Updates everything.
function renderTokenList(tokens, options = {}) {
  updateTokenTotalsAndChart(tokens, options);
  renderVisibleTokenRows();
}

if (tokenSearch) {
  tokenSearch.addEventListener('input', () => {
    renderVisibleTokenRows();
  });
}

const tokenListWrapper = document.querySelector('.token-list-scroll-wrapper');
tokenListWrapper.addEventListener('scroll', () => {
  const fadeEl = document.getElementById('tokenScrollFade');
  if (!fadeEl) return;
  const nearBottom = tokenListWrapper.scrollTop + tokenListWrapper.clientHeight >= tokenListWrapper.scrollHeight - 8;
  const hasOverflow = tokenListWrapper.scrollHeight > tokenListWrapper.clientHeight;
  if (!hasOverflow || nearBottom) {
    hide(fadeEl);
  } else {
    show(fadeEl);
  }
});

if (tokenSort) {
  tokenSort.addEventListener('click', () => openTokenSortOverlay());
}

// Tracks the active listbox's own teardown so a stray re-entrant call can
// never leave a duplicate document-level keydown listener attached.
let activeSortOverlayCleanup = null;

function openTokenSortOverlay() {
  if (activeSortOverlayCleanup) {
    activeSortOverlayCleanup();
  }

  const options = [
    { value: 'value', label: 'Sort by Value' },
    { value: 'amount', label: 'Sort by Amount' },
    { value: 'name', label: 'Sort by Name' },
  ];
  const currentValue = tokenSort.dataset.value || 'value';
  const arrowEl = document.getElementById('tokenSortArrow');
  const labelEl = document.getElementById('tokenSortLabel');

  const overlay = document.createElement('div');
  overlay.className = 'sort-overlay';

  const card = document.createElement('div');
  card.className = 'sort-card';
  card.id = 'tokenSortListbox';
  card.setAttribute('role', 'listbox');
  card.setAttribute('aria-label', 'Token sorting options');

  const optionEls = [];

  const closeOverlay = ({ restoreFocus = true } = {}) => {
    overlay.remove();
    unlockBodyScroll();
    arrowEl?.classList.remove('open');
    tokenSort.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleKeydown);
    activeSortOverlayCleanup = null;
    if (restoreFocus) tokenSort.focus();
  };

  const selectOption = (opt) => {
    tokenSort.dataset.value = opt.value;
    if (labelEl) labelEl.textContent = opt.label;
    closeOverlay();
    renderVisibleTokenRows();
  };

  const moveFocus = (fromIndex, delta) => {
    const base = fromIndex === -1 ? 0 : fromIndex;
    const nextIndex = (base + delta + optionEls.length) % optionEls.length;
    optionEls[nextIndex].focus();
  };

  const handleKeydown = (event) => {
    const activeIndex = optionEls.indexOf(document.activeElement);
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeOverlay();
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(activeIndex, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(activeIndex, -1);
        break;
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        if (activeIndex !== -1) selectOption(options[activeIndex]);
        break;
      default:
        break;
    }
  };

  options.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'sort-option' + (opt.value === currentValue ? ' selected' : '');
    row.id = `tokenSortOption-${opt.value}`;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(opt.value === currentValue));
    row.tabIndex = -1;

    const label = document.createElement('span');
    label.textContent = opt.label;

    const radio = document.createElement('span');
    radio.className = 'sort-option-radio';

    row.appendChild(label);
    row.appendChild(radio);

    row.addEventListener('click', () => selectOption(opt));

    card.appendChild(row);
    optionEls.push(row);
  });

  overlay.appendChild(card);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });

  document.body.appendChild(overlay);
  lockBodyScroll();
  arrowEl?.classList.add('open');
  tokenSort.setAttribute('aria-expanded', 'true');

  document.addEventListener('keydown', handleKeydown);
  activeSortOverlayCleanup = () => closeOverlay({ restoreFocus: false });

  const initialIndex = Math.max(0, options.findIndex(o => o.value === currentValue));
  optionEls[initialIndex]?.focus();
}

// ════════════════════════════════════════
// ── 17. PIE CHART ──
//Update chart instead of recreating when possible
// ════════════════════════════════════════

const OTHER_ID = '__other__';
const hiddenTokenIds = new Set();
let pieChartDrawing = false;
let currentPieSlices = [];


function drawPieChart(tokens, totalValue, options = {}) {
  const { skipSpinner = false } = options;
  const allPriced = tokens.filter(t => hasKnownPrice(t));

  if (allPriced.length === 0) {
    currentPieSlices = [];
    hide(pieSkeleton);
    hide(pieSpinner);
    hide(pieChart);
    document.getElementById('pieLegendCustom')?.replaceChildren();
    removePieHiddenIndicators();
    return;
  }

  // Rank the FULL priced list first — this decides top-5 vs Other membership.
  // Hiding a token must never reshuffle who else counts as top-5.
  const fullRanking = [...allPriced].sort((a, b) => getTokenUsdValue(b) - getTokenUsdValue(a));
  const rankedTop5 = fullRanking.slice(0, 5);
  const rankedRest = fullRanking.slice(5);

  // NOW filter hidden state — only affects what actually renders
  const visibleTop5 = rankedTop5.filter(t => !hiddenTokenIds.has(t.mint));
  const visibleRestForOther = rankedRest.filter(t => !hiddenTokenIds.has(t.mint));
  const otherHidden = hiddenTokenIds.has(OTHER_ID);

  const slices = visibleTop5.map(t => ({
    id: t.mint,
    label: t.symbol || 'Unknown',
    value: getTokenUsdValue(t),
    color: getTokenColorSafe(t),
    isOther: false,
    amount: parseFloat(t.amount) || 0,
    tokenCount: 1,
  }));

  if (visibleRestForOther.length > 0 && !otherHidden) {
    const otherValue = visibleRestForOther.reduce((sum, t) => sum + getTokenUsdValue(t), 0);
    const otherAmount = visibleRestForOther.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    slices.push({
      id: OTHER_ID,
      label: 'Other',
      value: otherValue,
      color: '#7c5cfc',
      isOther: true,
      amount: otherAmount,
      tokenCount: visibleRestForOther.length,
    });
  }

  currentPieSlices = slices;
  renderCustomPieLegend(slices);
  renderPieHiddenIndicators(slices.length > 0);

  if (slices.length === 0) {
    hide(pieChart);
    document.getElementById('pieLegendCustom')?.replaceChildren();
    return;
  }

  if (pieChartDrawing) return;
  pieChartDrawing = true;

  hide(pieSkeleton);
  if (!skipSpinner) show(pieSpinner);

  requestAnimationFrame(() => {  
    if (currentPieSlices.length === 0) {  
      // a later call emptied the pie before this frame painted — defer to it  
      hide(pieSpinner);  
      hide(pieChart);  
      pieChartDrawing = false;  
      return;  
    }  
  
    // Check BEFORE show() — this is true only when the canvas is coming
    // back from display:none (e.g. restoring from "all tokens hidden").
    // That's the one case resize() is actually needed for; forcing it on
    // every render caused instant snaps and size jumps on normal updates.
    const wasHidden = pieChart.classList.contains('hidden');

    hide(pieSpinner);  
    show(pieChart);  
  
    const labels = currentPieSlices.map(s => s.label);  
    const values = currentPieSlices.map(s => s.value);  
    const colors = currentPieSlices.map(s => s.color);  
  
    if (pieChartInstance) {  
      pieChartInstance.data.labels = labels;  
      pieChartInstance.data.datasets[0].data = values;  
      pieChartInstance.data.datasets[0].backgroundColor = colors;  
      if (wasHidden) {
        pieChartInstance.resize();
      }
      pieChartInstance.update();  
      pieChartDrawing = false;  
      return;  
    }

    const ctx = pieChart.getContext('2d');
    pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#12121a',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          // Reserves margin around the circle so hoverOffset (8px) has room
          // to push a hovered slice outward without hitting the canvas edge.
          // Needed now that the legend no longer reserves space internally.
          padding: 16,
        },
        plugins: {
          legend: {
            display: false, // replaced by #pieLegendCustom below the canvas — see renderCustomPieLegend()
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1a1a2e',
            titleColor: '#ffffff',
            bodyColor: '#7c5cfc',
            borderColor: '#7c5cfc',
            borderWidth: 1,
            padding: 6,
            callbacks: {
              label(context) {
                const slice = currentPieSlices[context.dataIndex];
                const visibleTotal = currentPieSlices.reduce((sum, s) => sum + s.value, 0);
                const percentage = visibleTotal > 0 ? ((slice.value / visibleTotal) * 100).toFixed(1) : '0.0';
                if (slice.isOther) {
                  return [
                    `Tokens: ${slice.tokenCount}`,
                    `Amount: ${formatTokenAmountShort(slice.amount)}`,
                    `Value: ${formatUSD(slice.value)}`,
                    `Share: ${percentage}%`,
                  ];
                }
                return [
                  `Amount: ${formatTokenAmountShort(slice.amount)}`,
                  `Value: ${formatUSD(slice.value)}`,
                  `Share: ${percentage}%`,
                ];
              },
            },
          },
        },
      },
    });
    pieChartDrawing = false;
  });
}

function renderCustomPieLegend(slices) {
  const container = document.getElementById('pieLegendCustom');
  if (!container) return;
  container.replaceChildren();

  slices.forEach(slice => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pie-legend-chip';

    const swatch = document.createElement('span');
    swatch.className = 'pie-legend-swatch';
    swatch.style.backgroundColor = slice.color;

    const label = document.createElement('span');
    label.className = 'pie-legend-label';
    label.textContent = slice.label;

    chip.appendChild(swatch);
    chip.appendChild(label);

    chip.addEventListener('click', () => {
      hiddenTokenIds.add(slice.id);
      drawPieChart(allTokens, 0, { skipSpinner: true });
    });

    container.appendChild(chip);
  });
}

function removePieHiddenIndicators() {
  document.getElementById('pieAllHiddenMsg')?.remove();
  document.getElementById('pieHiddenPartial')?.remove();
}

function renderPieHiddenIndicators(hasVisibleSlices) {
  removePieHiddenIndicators();
  if (hiddenTokenIds.size === 0) return;

  const restoreLink = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'pie-restore-link';
    link.textContent = 'Restore hidden tokens';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      hiddenTokenIds.clear();
      drawPieChart(allTokens, 0, { skipSpinner: true });
    });
    return link;
  };

  if (!hasVisibleSlices) {
    hide(pieChart);
    const msg = document.createElement('p');
    msg.id = 'pieAllHiddenMsg';
    msg.textContent = 'All tokens hidden — ';
    msg.appendChild(restoreLink());
    pieChart.insertAdjacentElement('beforebegin', msg);
  } else {
    const note = document.createElement('p');
    note.id = 'pieHiddenPartial';
    note.textContent = `${hiddenTokenIds.size} hidden — `;
    note.appendChild(restoreLink());
    const legendEl = document.getElementById('pieLegendCustom');
    (legendEl || pieChart).insertAdjacentElement('afterend', note);
  }
}

// ════════════════════════════════════════
// ── 18. NFTs ──
// ════════════════════════════════════════

async function fetchNFTs(address) {
  const signal = currentAbortController?.signal;
  const cacheKey = address.trim();

  try {
    let nfts = getClientCacheValue(clientNftCache, cacheKey);

    if (!nfts) {
      const res = await scheduleTraceRequest(
        () => fetch(`${API_BASE}/api/nfts?address=${address}`, { signal }),
        signal,
      );

      const data = await handleResponse(res);

      if (signal?.aborted || rateLimitedUntil) return;

      nfts = data.nfts || [];

      setClientCacheValue(
        clientNftCache,
        cacheKey,
        nfts,
        CLIENT_NFT_CACHE_TTL_MS
      );
    }

    if (signal?.aborted || rateLimitedUntil) return;

    primeClientNftImageCache(nfts);

    if (nfts.length === 0) {
      nftGrid.replaceChildren();
      hideSkeletonShowContent(nftSkeleton, nftList, nftGrid);

      const msg = document.createElement('p');
      msg.className = 'empty-msg';
      msg.textContent = 'This wallet has no NFTs';

      nftList.replaceChildren(msg);
      revealCard(nftList.closest('.card'));
      return;
    }

    nftCountBadge.textContent = nfts.length;
    show(nftCountBadge);

    renderNFTList(nfts);
    renderNFTGrid(nfts);

    hideSkeletonShowContent(nftSkeleton, nftList, nftGrid);
    revealCard(nftList.closest('.card'));

  } catch (error) {
    if (
      error?.type === 'ratelimit' ||
      error?.name === 'AbortError' ||
      rateLimitedUntil
    ) {
      return;
    }

    failedFetchCount++;
    recordCardFailure('nfts', error?.type || 'server');

    console.error('NFT error:', error);

    nftGrid.replaceChildren();
    nftList.replaceChildren();

    hideSkeletonShowContent(nftSkeleton, nftList, nftGrid);

    const msg = document.createElement('p');
    msg.id = 'nftListError';
    msg.className = 'empty-msg';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.textContent = 'Unable to load NFTs';

    nftList.appendChild(msg);
  }
}

function renderNFTList(nfts) {
  if (nfts.length === 0) {
  nftList.replaceChildren();
  return;
    }
  const collections = {};
  nfts.forEach(nft => {
    const collection = nft.grouping?.[0]?.group_value ||
      nft.content?.metadata?.symbol ||
      nft.collection?.name ||
      'Unknown Collection';
    if (!collections[collection]) collections[collection] = [];
    collections[collection].push(nft);
  });

  const fragment = document.createDocumentFragment();

  Object.entries(collections).forEach(([collectionName, items]) => {
    const group = document.createElement('div');
    group.className = 'nft-group';

    const header = document.createElement('button');
    header.type = 'button';
    header.setAttribute('aria-expanded', 'false');
    header.className = 'nft-group-header';

    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-right nft-group-chevron';

    const name = document.createElement('span');
    name.className = 'nft-group-name';
    name.textContent = collectionName;

    const badge = document.createElement('span');
    badge.className = 'nft-group-badge';
    badge.textContent = items.length;

    header.appendChild(chevron);
    header.appendChild(name);
    header.appendChild(badge);

    const chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'nft-chips-wrapper hidden';

    items.forEach(nft => {
      const chip = document.createElement('span');
      chip.className = 'nft-chip';
      chip.textContent = nft.content?.metadata?.name || nft.name || 'Unknown NFT';
      chipsWrapper.appendChild(chip);
    });

    header.addEventListener('click', () => {
      const isOpen = !chipsWrapper.classList.contains('hidden');
      if (isOpen) {
    hide(chipsWrapper);
    chevron.classList.remove('open');
    header.setAttribute('aria-expanded', 'false');
    } else {
    show(chipsWrapper);
    chevron.classList.add('open');
    header.setAttribute('aria-expanded', 'true');
       }
    });

    group.appendChild(header);
    group.appendChild(chipsWrapper);
    fragment.appendChild(group);
  });

  nftList.replaceChildren(fragment);
}

function renderNFTGrid(nfts) {
  const sorted = [...nfts].sort((a, b) => {
    const nameA = a.content?.metadata?.name || a.name || '';
    const nameB = b.content?.metadata?.name || b.name || '';
    return nameA.localeCompare(nameB);
  });

  const fragment = document.createDocumentFragment();
  sorted.forEach((nft, index) => {
    const name = nft.content?.metadata?.name || nft.name || 'Unknown NFT';
    const assetId = nft?.id || nft?.assetId || nft?.asset_id;

const image =
  (assetId &&
    getClientCacheValue(
      clientNftImageCache,
      `asset:${assetId}`
    )) ||
  nft.content?.links?.image ||
  nft.content?.files?.[0]?.uri ||
  nft.image ||
  '';

    const card = document.createElement('div');
    card.className = 'nft-card';

    const numberSpan = document.createElement('span');
    numberSpan.className = 'nft-number';
    numberSpan.textContent = `#${index + 1}`;

    const img = document.createElement('img');
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    img.dataset.src = image;
    img.alt = name;
    img.className = 'nft-image';
    img.loading = 'lazy';
    img.onerror = () => {
      // Use backend token logo fallback
      img.src = `${API_BASE}/api/nft-image-fallback`;
      img.onerror = () => {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      };
    };

    const nameSpan = document.createElement('span');
    nameSpan.className = 'nft-name';
    nameSpan.textContent = name;

    card.appendChild(numberSpan);
    card.appendChild(img);
    card.appendChild(nameSpan);
    fragment.appendChild(card);
  });

  nftGrid.replaceChildren(fragment);

  // Lazy load NFT images
  nftGrid.querySelectorAll('img[data-src]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src;
  });
}

// ════════════════════════════════════════
// ── 19. TRANSACTIONS ──
// ════════════════════════════════════════

async function fetchWalletActivityChart(address) {
  removeAllById('barChartError');
removeAllById('barChartEmpty');

  try {
    const signal = currentAbortController?.signal;
    const res = await scheduleTraceRequest(
  () => fetch(`${API_BASE}/api/transactions/chart?address=${address}`, { signal }),
  signal,
);
    const data = await handleResponse(res);

    if (signal?.aborted || rateLimitedUntil) return;

    allChartTransactions = Array.isArray(data.transactions) ? data.transactions : [];
    chartDataIsPartial = Boolean(data.partial);
    chartPagesFetched = Number.isFinite(data.pagesFetched) ? data.pagesFetched : 0;

    if (chartDataIsPartial) {
      console.warn(
        `Wallet activity chart is showing partial data — ${chartPagesFetched} page(s) fetched, ` +
        `${allChartTransactions.length} transaction(s) loaded. Older activity within the selected ` +
        `range may not be reflected.`
      );
    }

    if (signal?.aborted || rateLimitedUntil) return;

    if (allChartTransactions.length === 0) {
      barDataAvailable = false;
      hide(barSkeleton);
      hide(barChart);
      barChart.closest('.chart-scroll-wrapper')?.classList.remove('chart-reserved');
      const noActivityMsg = document.createElement('p');
      noActivityMsg.id = 'barChartEmpty';
      noActivityMsg.className = 'empty-msg';
      noActivityMsg.textContent = 'This wallet has no chart activity';
      barChart.closest('.chart-scroll-wrapper')?.appendChild(noActivityMsg);
      return;
    }

    barDataAvailable = true;
    renderBarChart(allChartTransactions, currentBarRange, currentYearSelection);
  } catch (error) {
    if (error?.type === 'ratelimit' || error?.name === 'AbortError' || rateLimitedUntil) return;

    barDataAvailable = false;
    failedFetchCount++;
    recordCardFailure('chart', error?.type || 'server');
    console.error('Wallet activity chart error:', error);

    hide(barSkeleton);
    hide(barChart);
    barChart.closest('.chart-scroll-wrapper')?.classList.remove('chart-reserved');

    const barErrorMsg = document.createElement('p');
    barErrorMsg.id = 'barChartError';
    barErrorMsg.className = 'empty-msg';
    barErrorMsg.setAttribute('role', 'status');
    barErrorMsg.setAttribute('aria-live', 'polite');
    barErrorMsg.textContent = 'Unable to load wallet activity chart';
    barChart.closest('.chart-scroll-wrapper')?.appendChild(barErrorMsg);
  }
}

async function fetchRecentTransactions(address) {
  try {
    const signal = currentAbortController?.signal;
    const res = await scheduleTraceRequest(
  () => fetch(`${API_BASE}/api/transactions/recent?address=${address}`, { signal }),
  signal,
);
    const data = await handleResponse(res);

    if (signal?.aborted || rateLimitedUntil) return;

    allRecentTransactions = Array.isArray(data.transactions) ? data.transactions : [];

    if (signal?.aborted || rateLimitedUntil) return;

    await renderRecentTransactions(allRecentTransactions, { signal });
  } catch (error) {
    if (error?.type === 'ratelimit' || error?.name === 'AbortError' || rateLimitedUntil) return;

    failedFetchCount++;
    recordCardFailure('recent', error?.type || 'server');
    console.error('Recent transactions error:', error);

    hideSkeletonShowContent(txSkeleton, last7txList);
    hide(solscanLink);
    hide(seemore);

    const msg = document.createElement('p');
    msg.id = 'recentTxError';
    msg.className = 'empty-msg';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.textContent = 'Unable to load transactions';
    last7txList.replaceChildren(msg);
  }
}

// Dedicated, lightweight call for wallet age — decoupled from the chart/recent
// transaction fetches on purpose (see formatWalletAge). Uses the same
// handleResponse/abort/lockout
// pattern as every other fetch here, so a 429 from this call is handled by the
// single existing enterServerRateLimitState path — it cannot create a second
// lockout or bypass the budget/lockout architecture.
async function fetchWalletAge(address) {
  const signal = currentAbortController?.signal;

  try {
    const res = await scheduleTraceRequest(
  () => fetch(`${API_BASE}/api/wallet-age?address=${address}`, { signal }),
  signal,
);
    const data = await handleResponse(res);

    if (signal?.aborted || rateLimitedUntil) return;

    const age = formatWalletAge(data.firstTransactionTimestamp);

    if (age) {
  walletAgeEl.textContent = age;
  walletAgeEl.classList.remove('age-error');
  solAgeFailed = false;
} else {
  walletAgeEl.textContent = 'Age unavailable';
  walletAgeEl.classList.add('age-error');
  solAgeFailed = true;
}
    show(document.getElementById('walletAgeSection'));
    hide(document.getElementById('walletAgeSkeleton'));
    show(document.getElementById('walletAgeRow'));
    if (!solCardRevealed) {
      revealCard(solBalanceRow.closest('.card'));
      solCardRevealed = true;
    }
  } catch (error) {
    if (error?.type === 'ratelimit' || error?.name === 'AbortError' || rateLimitedUntil) return;

    solAgeFailed = true;
walletAgeEl.textContent = 'Age unavailable';
walletAgeEl.classList.add('age-error');
show(document.getElementById('walletAgeSection'));
hide(document.getElementById('walletAgeSkeleton'));
show(document.getElementById('walletAgeRow'));
recordCardFailure('age', error?.type || 'server');
console.error('Wallet age error:', error);
    if (!solCardRevealed) {
      revealCard(solBalanceRow.closest('.card'));
      solCardRevealed = true;
    }
  }
}

const GENERIC_SOURCES = new Set(['SYSTEM_PROGRAM', 'UNKNOWN']);

function getRecognizedSourceLabel(tx) {
  const source = tx.source;
  if (!source || GENERIC_SOURCES.has(source.toUpperCase())) return null;
  // e.g. "MARINADE" -> "Marinade", "MAGIC_EDEN_V2" -> "Magic Eden V2"
  return source
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function describeTransaction(tx, txTokenMetadata) {
  const type = tx.type?.toUpperCase() || '';

  // For SPL token transfers, build our own wording from tokenTransfers +
  // resolved metadata, rather than trusting Helius's auto-generated text —
  // Helius sometimes embeds raw mint/pump-suffix instead of a real name.
  if (type === 'TRANSFER' && Array.isArray(tx.tokenTransfers) && tx.tokenTransfers.length > 0) {
    const t = tx.tokenTransfers[0];
    const meta = txTokenMetadata?.get(t.mint);
    const tokenLabel = meta?.symbol || truncateAddress(t.mint);
    const from = truncateAddress(t.fromUserAccount);
    const to = truncateAddress(t.toUserAccount);
    return `${from} transferred ${t.tokenAmount} ${tokenLabel} to ${to}`;
  }

  if (tx.description) {
    const truncated = tx.description.replace(/[1-9A-HJ-NP-Za-km-z]{32,44}/g, (match) => truncateAddress(match));
    const sourceLabel = getRecognizedSourceLabel(tx);
    return sourceLabel ? `${truncated} via ${sourceLabel}` : truncated;
  }
  if (type === 'TRANSFER') {
    if (tx.feePayer === currentWalletAddress) return `Sent SOL to ${truncateAddress(tx.nativeTransfers?.[0]?.toUserAccount || 'unknown')}`;
    return `Received SOL from ${truncateAddress(tx.nativeTransfers?.[0]?.fromUserAccount || 'unknown')}`;
  }
  if (type === 'SWAP') return 'Swapped tokens';
  if (type === 'NFT_SALE') return 'Sold an NFT';
  if (type === 'NFT_MINT') return 'Minted an NFT';
  if (type === 'STAKE') return 'Staked SOL';
  return 'Interacted with a Solana program';
}

function getTxIconClass(tx) {
  const type = tx.type?.toUpperCase() || '';
  if (type === 'SWAP') return 'swap';
  if (type === 'NFT_SALE' || type === 'NFT_MINT') return 'swap';
  if (tx.feePayer === currentWalletAddress) return 'send';
  return 'receive';
}

function getTxIconSymbol(tx) {
  const type = tx.type?.toUpperCase() || '';
  if (type === 'SWAP') return '⟳';
  if (type === 'NFT_SALE' || type === 'NFT_MINT') return '🖼';
  if (tx.feePayer === currentWalletAddress) return '↑';
  return '↓';
}

// Keep renderRecentTransactions exactly as-is.
async function renderRecentTransactions(transactions, options = {}) {
  const signal = options.signal || currentAbortController?.signal;
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

    const recentTransactions = safeTransactions.slice(0, CONFIG.MAX_RECENT_TX);

  const txMints = [...new Set(
    recentTransactions
      .flatMap(tx => tx.tokenTransfers?.map(t => t.mint) || [])
      .filter(Boolean)
  )];

  let txTokenMetadata = new Map();
const missingTxMints = [];

for (const mint of txMints) {
  const cachedMetadata = getClientCacheValue(
    clientTokenMetadataCache,
    mint
  );

  if (cachedMetadata) {
    txTokenMetadata.set(mint, cachedMetadata);
  } else {
    missingTxMints.push(mint);
  }
}

if (
  missingTxMints.length > 0 &&
  !signal?.aborted &&
  !rateLimitedUntil
) {
  try {
    const res = await fetch(
      `${API_BASE}/api/token-metadata?mints=${missingTxMints.join(',')}`,
      { signal }
    );

    if (res.ok) {
      const data = await res.json();

      for (const [mint, metadata] of Object.entries(
        data.metadata || {}
      )) {
        txTokenMetadata.set(mint, metadata);

        setClientCacheValue(
          clientTokenMetadataCache,
          mint,
          metadata,
          CLIENT_TOKEN_METADATA_CACHE_TTL_MS
        );
      }
    }
  } catch (error) {
    if (error?.name !== 'AbortError') {
      // fall through to mint-address display
    }
  }
}

  if (safeTransactions.length === 0) {
    hideSkeletonShowContent(txSkeleton, last7txList);
    hide(solscanLink);
    hide(seemore);
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'This wallet has no transactions';
    last7txList.replaceChildren(msg);
    return;
  }

    const recent = recentTransactions;
  const grouped = {};
  recent.forEach(tx => {
    const dateKey = formatTxDate(tx.timestamp || tx.blockTime);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(tx);
  });

  const fragment = document.createDocumentFragment();

  Object.entries(grouped).forEach(([date, txs]) => {
    const dateHeader = document.createElement('p');
    dateHeader.className = 'tx-date-group';
    dateHeader.textContent = date;
    fragment.appendChild(dateHeader);

    txs.forEach(tx => {
      const row = document.createElement('div');
      row.className = 'tx-row';

      // Transaction type icon
      const iconSpan = document.createElement('span');
      iconSpan.className = `tx-icon ${getTxIconClass(tx)}`;
      iconSpan.textContent = getTxIconSymbol(tx);

      // Transaction text
      const textSpan = document.createElement('span');
      textSpan.className = 'tx-text';
      textSpan.textContent = describeTransaction(tx, txTokenMetadata);

                  const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-sig-btn';
      copyBtn.title = 'Copy transaction signature';
      copyBtn.setAttribute('aria-label', 'Copy transaction signature');
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';

              const signature = tx.signature || tx.signatures?.[0] || '';
        copyBtn.addEventListener('click', async () => {
          if (!signature) return;
          await copyToClipboard(signature);
          showCopySuccess(copyBtn, '<i class="fa-regular fa-copy"></i>');
        });

      row.appendChild(iconSpan);
      row.appendChild(textSpan);
      row.appendChild(copyBtn);
      fragment.appendChild(row);
    });
  });

  last7txList.replaceChildren(fragment);
  hideSkeletonShowContent(txSkeleton, last7txList);
  show(solscanLink);
  show(seemore);
  if (!barCardRevealed) {
    revealCard(last7txList.closest('.card'));
    barCardRevealed = true;
  }
}

// ════════════════════════════════════════
// ── 20. BAR CHART ──
//Update chart instead of recreating
// ════════════════════════════════════════

function buildBarChartData(transactions, range, yearCount = 1) {
  const now = new Date();
  const labels = [];
  const counts = [];

  if (range === 'days') {
    for (let i = CONFIG.DAYS_COUNT - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
      counts.push(transactions.filter(tx => {
        const txDate = new Date((tx.timestamp || tx.blockTime) * 1000);
        return txDate.toDateString() === day.toDateString();
      }).length);
    }
  } else if (range === 'month') {
    for (let i = CONFIG.MONTH_COUNT - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
      counts.push(transactions.filter(tx => {
        const txDate = new Date((tx.timestamp || tx.blockTime) * 1000);
        return txDate.getMonth() === month.getMonth() && txDate.getFullYear() === month.getFullYear();
      }).length);
    }
  } else if (range === 'year') {
    if (yearCount === 1) {
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        counts.push(transactions.filter(tx => {
          const txDate = new Date((tx.timestamp || tx.blockTime) * 1000);
          return txDate.getMonth() === month.getMonth() && txDate.getFullYear() === month.getFullYear();
        }).length);
      }
    } else {
      for (let i = yearCount - 1; i >= 0; i--) {
        const year = now.getFullYear() - i;
        labels.push(String(year));
        counts.push(transactions.filter(tx => {
          const txDate = new Date((tx.timestamp || tx.blockTime) * 1000);
          return txDate.getFullYear() === year;
        }).length);
      }
    }
  }

  return { labels, counts };
}

function renderBarChart(transactions, range, yearCount = 1) {
  hide(barSkeleton);
  // Only show the spinner for a genuine first draw — toggles reuse in-memory
  // data and update synchronously, no wait is actually needed
  const isFirstDraw = !barChartInstance;
  if (isFirstDraw) show(barSpinner);

  const { labels, counts } = buildBarChartData(transactions, range, yearCount);

  requestAnimationFrame(() => {
    hide(barSpinner);
    show(barChart);

    // Update existing bar chart instead of recreating
  if (barChartInstance) {
      barChartInstance.data.labels = labels;
      barChartInstance.data.datasets[0].data = counts;
      barChartInstance.resize();
      barChartInstance.update();
      if (!barCardRevealed) {
        revealCard(barChart.closest('.card'));
        barCardRevealed = true;
      }
      return;
    }

    const ctx = barChart.getContext('2d');
    const barColor = '#7c5cfc';

    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Transactions',
          data: counts,
          backgroundColor: barColor,
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
          minBarLength: (ctx) => {
            const value = ctx.chart?.data?.datasets?.[ctx.datasetIndex]?.data?.[ctx.dataIndex];
            if (!(value > 0)) return 0;
            const areaHeight = ctx.chart?.chartArea?.height;
            if (!Number.isFinite(areaHeight) || areaHeight <= 0) return 5; // not laid out yet
            return Math.max(3, Math.round(areaHeight * 0.015));
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        onResize: (chart) => {
          chart.update();
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#1a1a2e',
            titleColor: '#ffffff',
            bodyColor: '#7c5cfc',
            borderColor: '#7c5cfc',
            borderWidth: 1,
            padding: 12,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (item) => `Transactions: ${item.raw}`,
              labelColor: () => ({
                borderColor: '#7c5cfc',
                backgroundColor: '#7c5cfc',
              }),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#7c5cfc', font: { family: 'Space Grotesk', size: 11 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            
            grid: { display: true, drawOnChartArea: true, color: 'rgba(124, 92, 252, 0.4)' },
            border: { display: false },
            
            ticks: { 
              color: '#7c5cfc', 
              font: { family: 'Space Grotesk', size: 11 },
              
              maxTicksLimit: 10, 
              precision: 0,
              
              callback: function(value) {
                if (value === 0) return '0'; 
                if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
                if (value >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
                return Math.round(value).toString();
              }
            },
          },
        },
      },
    });

    barChartInstance.resize();
    if (!barCardRevealed) {
      revealCard(barChart.closest('.card'));
      barCardRevealed = true;
    }
  });
}

// ════════════════════════════════════════
// ── 21. WALLET ACTIVITY TOGGLES ──
// ════════════════════════════════════════

toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!barDataAvailable) return;

    const range = btn.dataset.range;

    // Reset all toggles
    toggleBtns.forEach(b => { b.classList.remove('active'); b.style.transform = ''; b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.style.transform = 'scale(1.15)';
    btn.setAttribute('aria-pressed', 'true');

    if (range === 'year') {
      const isOpen = !yearDropdown.classList.contains('hidden');
      if (isOpen) {
        hide(yearDropdown);
        if (yearRangeActive) {
          // A year was already picked — keep it active, don't touch the chart
          btn.classList.add('active');
          btn.style.transform = 'scale(1.15)';
          btn.setAttribute('aria-pressed', 'true');
        } else {
          // Dropdown closed without ever picking a year — no chart change needed,
          // it was never altered in the first place
          btn.style.transform = '';
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      } else {
        yearOptions.forEach(opt => {
          const isSelected = parseInt(opt.dataset.year) === currentYearSelection && yearRangeActive;
          opt.classList.toggle('selected', isSelected);
          opt.setAttribute('aria-pressed', String(isSelected));
        });
        show(yearDropdown);
      }
    } else {
      yearRangeActive = false;
      hide(yearDropdown);
      if (yearToggleBtn) yearToggleBtn.textContent = 'Year';
      yearOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-pressed', 'false');
      });
      currentBarRange = range;
      renderBarChart(allChartTransactions, range, currentYearSelection);
    }
  });
});

yearOptions.forEach(option => {
  option.addEventListener('click', () => {
    if (!barDataAvailable) return;

    currentYearSelection = parseInt(option.dataset.year);
    currentBarRange = 'year';
    yearRangeActive = true;
    yearOptions.forEach(opt => {
      opt.classList.toggle('selected', opt === option);
      opt.setAttribute('aria-pressed', String(opt === option));
    });
    hide(yearDropdown);
    if (yearToggleBtn) yearToggleBtn.textContent = `${currentYearSelection} Year${currentYearSelection > 1 ? 's' : ''}`;
    renderBarChart(allChartTransactions, 'year', currentYearSelection);
  });
});

// ════════════════════════════════════════
// ── 22. WALLET TOTAL NET WORTH ──
//Use stored variables — no duplicate API call
// ════════════════════════════════════════

function updateNetWorth() {
  if (rateLimitedUntil) return;

  removeAllById('netWorthError');
removeAllById('netWorthEmpty');
removeAllById('netWorthPending');

  // A product/sum needs EVERY input valid — if either half of the math can't
  // be trusted, the total can't be trusted. Never silently treat a failed
  // fetch's untouched default (0 / empty array) as a real zero.
  const solPortionInvalid = solBalanceFailed || solPriceFailed;
  const tokenPortionInvalid = tokenFetchFailed;

  if (solPortionInvalid || tokenPortionInvalid) {
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthError';
    msg.className = 'empty-msg';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.textContent = 'Unable to load total net worth';
    totalNetWorth.appendChild(msg);
    return;
  }

  // Past this point, both inputs are confirmed genuinely valid — safe to
  // treat 0 / empty as real values now, not failure-masked defaults.
  if (currentSolBalance === 0 && allTokens.length === 0) {
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthEmpty';
    msg.className = 'empty-msg';
    msg.textContent = 'This wallet has no assets';
    totalNetWorth.appendChild(msg);
    return;
  }

  if (currentSolBalance === 0 && allTokens.length > 0 && allTokens.every(t => t.priceUnavailable)) {
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthPending';
    msg.className = 'empty-msg';
    msg.textContent = `Value pending • ${allTokens.length} token${allTokens.length > 1 ? 's' : ''} held • Price pending`;
    totalNetWorth.appendChild(msg);
    return;
  }

  try {
    const solValueUSD = currentSolBalance * currentSolPrice;
    const tokenTotal = allTokens.reduce((sum, t) => sum + getTokenUsdValue(t), 0);
    const total = solValueUSD + tokenTotal;

    netWorthValue.removeAttribute('role');
    netWorthValue.removeAttribute('aria-live');
    netWorthValue.textContent = formatUSD(total);
    netWorthValue.style.color = 'var(--off-white)';
    hide(netWorthSkeleton);
    show(netWorthLabel);
    show(netWorthValue);
    if (!netWorthRevealed) {
      revealCard(totalNetWorth);
      netWorthRevealed = true;
    }
  } catch (error) {
    console.error('Net worth error:', error);
    hide(netWorthSkeleton);
    netWorthValue.setAttribute('role', 'status');
    netWorthValue.setAttribute('aria-live', 'polite');
    netWorthValue.textContent = 'Unable to load total net worth';
    show(netWorthLabel);
    show(netWorthValue);
  }
}

// ════════════════════════════════════════
// ── 23. LIVE PRICE UPDATES ──
// ════════════════════════════════════════

async function fetchLivePrices() {
  if (!currentWalletAddress || rateLimitedUntil || currentAbortController) return;

  if (liveUpdateAbortController) {
    liveUpdateAbortController.abort();
  }

  liveUpdateAbortController = new AbortController();
  if (currentAbortController) {
    liveUpdateAbortController.abort();
    liveUpdateAbortController = null;
    return;
  }

  const { signal } = liveUpdateAbortController;
  const walletSnapshot = currentWalletAddress;

  const liveUpdateCost = getLiveUpdateRequestCost();
  // Cost is passed to the backend so it can authoritatively decide whether the
  // remaining budget covers a full live-update cycle — never decided client-side.
  const rateLimitCheck = await checkRateLimitGate(liveUpdateCost);

    if (rateLimitCheck.rateLimited) {
    if (hasValidLockoutResetAt(rateLimitCheck)) {
      enterServerRateLimitState(rateLimitCheck);
    } else {
      showError('server');
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/sol-price`, {
      signal,
      cache: 'no-store',
    });

    if (signal.aborted || rateLimitedUntil || walletSnapshot !== currentWalletAddress) return;

        if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      if (hasValidLockoutResetAt(body)) {
        enterServerRateLimitState(body);
        return;
      }

      showError('server');
      return;
    }

    if (res.ok) {
      const priceData = await res.json();
      if (signal.aborted || rateLimitedUntil || walletSnapshot !== currentWalletAddress) return;

      currentSolPrice = priceData.price || 0;
      const change = priceData.change24h || 0;
      solPriceFailed = false;

      solPriceEl.textContent = formatUSD(currentSolPrice);
      const changeFormatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
      solPriceChange.textContent = changeFormatted;
      solPriceChange.className = 'sol-change ' + (change >= 0 ? 'gain' : 'loss');
      hide(document.getElementById('solMarketUnavailable'));
      show(document.getElementById('solMarketPriceRow'));
      show(document.getElementById('solMarketChangeRow'));

      if (currentSolBalance > 0) {
        solBalanceUsd.textContent = formatUSD(currentSolBalance * currentSolPrice);
        show(solBalanceUsd);
      } else {
        hide(solBalanceUsd);
      }
    } else {
      solPriceFailed = true;
      hide(document.getElementById('solMarketPriceRow'));
      hide(document.getElementById('solMarketChangeRow'));
      show(document.getElementById('solMarketUnavailable'));
    }

    if (signal.aborted || rateLimitedUntil || walletSnapshot !== currentWalletAddress) return;

    // Live Jupiter-only price refresh — Raydium deliberately excluded here per its
    // own docs ("not suitable for real-time tracking"); Raydium only runs once,
    // at initial search time, via the full /api/tokens route.
    if (allTokens.length > 0) {
      const mintList = allTokens.map(t => t.mint).filter(Boolean);
      const priceRes = await fetch(`${API_BASE}/api/token-prices-live`, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mints: mintList }),
      });

      if (signal.aborted || rateLimitedUntil || walletSnapshot !== currentWalletAddress) return;

                  if (priceRes.status === 429) {
  const body = await priceRes.json().catch(() => ({}));

  if (hasValidLockoutResetAt(body)) {
    enterServerRateLimitState(body);
    return;
  }

  showError('server');
  return;
}

      if (priceRes.ok) {
        const { prices, unpriced } = await priceRes.json();
        if (signal.aborted || rateLimitedUntil || walletSnapshot !== currentWalletAddress) return;

        let updated = false;
        allTokens.forEach(t => {
          if (prices[t.mint] !== undefined) {
            t.priceUsd = prices[t.mint];
            t.priceUnavailable = false;
            updated = true;
          } else if (unpriced?.includes(t.mint)) {
            t.priceUnavailable = true;
          }
        });

        if (updated && !rateLimitedUntil && walletSnapshot === currentWalletAddress) {
          renderTokenList(allTokens, { skipSpinner: true });
        }
      }
    }

    if (!rateLimitedUntil && walletSnapshot === currentWalletAddress) {
      updateNetWorth();
    }
  } catch (error) {
    if (error?.name === 'AbortError' || rateLimitedUntil) return;

    liveUpdateFailures++;

    if (liveUpdateFailures >= 5) {
      clearInterval(liveUpdateInterval);
      liveUpdateInterval = null;
      if (liveUpdateAbortController) {
        liveUpdateAbortController.abort();
        liveUpdateAbortController = null;
      }
      console.warn('Live updates stopped after repeated failures.');
      return;
    }

    console.warn('Live update failed:', error);
  } finally {
    if (liveUpdateAbortController?.signal === signal) {
      liveUpdateAbortController = null;
    }
  }
}

// ════════════════════════════════════════
// ── 24. COPY WALLET ADDRESS ──
// ════════════════════════════════════════

if (copyAddressBtn) {
  copyAddressBtn.addEventListener('click', async () => {
    if (!currentWalletAddress) return;
    await copyToClipboard(currentWalletAddress);
    showCopySuccess(copyAddressBtn, '<i class="fa-regular fa-copy"></i>');
  });
}

// ════════════════════════════════════════
// ── 25. SHARE WALLET BUTTON ──
// ════════════════════════════════════════

if (shareWalletBtn) {
  const shareWalletDefaultText = shareWalletBtn.textContent; // captured once, never re-read from mutated DOM
  let shareWalletResetTimer = null;

  shareWalletBtn.addEventListener('click', async () => {
    if (!currentWalletAddress) return;
    const shareUrl = `${window.location.origin}?wallet=${currentWalletAddress}`;
    await copyToClipboard(shareUrl);
    clearTimeout(shareWalletResetTimer); // cancel any pending revert from a prior rapid click
    shareWalletBtn.textContent = '✓ Link copied!';
    shareWalletResetTimer = setTimeout(() => {
      shareWalletBtn.textContent = shareWalletDefaultText;
    }, CONFIG.COPY_RESET_DELAY);
  });
}

// Auto search if wallet in URL
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const walletParam = params.get('wallet');
  if (walletParam && isValidSolanaAddress(walletParam)) {
    walletInput.value = walletParam;
    handleSearch();
  }
});

// ════════════════════════════════════════
// ── 26. CLEAR BUTTON ──
// ════════════════════════════════════════

if (clearBtn) {
  clearBtn.addEventListener('click', resetAll);
}

// ════════════════════════════════════════
// ── 27. SEARCH BUTTON ──
// ════════════════════════════════════════

if (searchBtn) {
  searchBtn.addEventListener('click', handleSearch);
}

walletInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// ════════════════════════════════════════
// ── 28. BACK TO TOP ──
// ════════════════════════════════════════

// Code written — button currently commented out in HTML
// When HTML comment is removed this will work automatically

window.addEventListener('scroll', () => {
  if (backToTopBtn) {
    if (window.scrollY > CONFIG.SCROLL_THRESHOLD) show(backToTopBtn);
    else hide(backToTopBtn);
  }
});

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}



// ════════════════════════════════════════
// ── 29. ACCORDIONS ──
// ════════════════════════════════════════

accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    const arrow = btn.querySelector('.arrow');
    const isOpen = !content.classList.contains('hidden');
    if (isOpen) { hide(content); arrow?.classList.remove('open'); }
    else { show(content); arrow?.classList.add('open'); }
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

// ════════════════════════════════════════
// ── 30. OFFLINE DETECTION ──
// ════════════════════════════════════════

// Once the offline banner is showing, don't rely solely on the browser's
// "online" event to know when to clear it — that event is not guaranteed
// to fire (confirmed real-world failure: toggling mobile data off then
// back on can leave navigator.onLine's "online" event never firing, so
// the banner would otherwise stay stuck until a full page reload). While
// the banner is visible, poll our own /api/ping route on a short interval
// as a backstop, in addition to reacting to the online/offline events
// when they do fire.
let connectivityRecoveryPoll = null;

function stopConnectivityRecoveryPoll() {
  if (connectivityRecoveryPoll) {
    clearInterval(connectivityRecoveryPoll);
    connectivityRecoveryPoll = null;
  }
}

function startConnectivityRecoveryPoll() {
  if (connectivityRecoveryPoll) return;
  connectivityRecoveryPoll = setInterval(async () => {
    const actuallyOnline = await verifyRealConnectivity();
    if (actuallyOnline) {
      stopConnectivityRecoveryPoll();
      hide(networkErrorMsg);
      if (currentWalletAddress && !rateLimitedUntil && liveUpdateInterval && !currentAbortController) {
        fetchLivePrices();
      }
    }
  }, 5000);
}

const handleConnectivityChange = debounce(async () => {
  const actuallyOnline = await verifyRealConnectivity();

  if (actuallyOnline) {
    stopConnectivityRecoveryPoll();
    hide(networkErrorMsg);
    if (currentWalletAddress && !rateLimitedUntil && liveUpdateInterval && !currentAbortController) {
      fetchLivePrices();
    }
  } else {
    showError('offline');
    startConnectivityRecoveryPoll();
  }
}, 1000);

window.addEventListener('offline', handleConnectivityChange);
window.addEventListener('online', handleConnectivityChange);

// navigator.onLine's own offline/online events are not guaranteed to fire
// for every real transition (confirmed: VPN interface changes can mask
// or delay them). Reading navigator.onLine's current VALUE, on the other
// hand, costs nothing — no network request, just an OS-reported flag —
// so it's cheap enough to sample on a short interval continuously, unlike
// the actual /api/ping check. This watcher only calls the real ping-based
// check when the sampled value has CHANGED since the last sample, which
// catches transitions the events themselves might silently miss, without
// ever polling the network endpoint on a fixed schedule.
let lastKnownOnlineState = navigator.onLine;

setInterval(() => {
  if (navigator.onLine !== lastKnownOnlineState) {
    lastKnownOnlineState = navigator.onLine;
    handleConnectivityChange();
  }
}, 2000);

// setInterval-based polling (startConnectivityRecoveryPoll) can be paused
// or throttled by the browser while the page is backgrounded/screen is
// locked — confirmed platform behavior, most aggressive on mobile Safari,
// which suspends timers shortly after backgrounding. Without this, a user
// who backgrounds the app while the offline banner is showing and returns
// after connectivity is restored could still see a stale banner until the
// next (possibly delayed) poll tick. Forcing a check on visibilitychange
// closes that gap by re-checking the instant the page is foregrounded
// again, instead of waiting on the timer.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !networkErrorMsg.classList.contains('hidden')) {
    handleConnectivityChange();
  }
});

window.addEventListener('pageshow', () => {
  void restorePersistedRateLimitCountdownOnce();
});

// ════════════════════════════════════════
// ── 31. INITIALIZATION ──
// ════════════════════════════════════════

renderSearchHistory();
void restorePersistedRateLimitCountdownOnce();

// ════════════════════════════════════════
// ── 32. FEEDBACK WIDGET ──
// ════════════════════════════════════════

const FEEDBACK_DEFAULT_HELPER =
  'Send us feedback, suggestions, or bug reports.';

const FEEDBACK_EMPTY_MESSAGE =
  'Please enter your feedback';

const FEEDBACK_SUCCESS_MESSAGE =
  'Thanks for your feedback!';

const FEEDBACK_FAILURE_MESSAGE =
  'Unable to send feedback, please try again later';

const FEEDBACK_TOO_FAST_MESSAGE =
  'You are submitting too fast. Please wait a moment and try again.';

const FEEDBACK_HELPER_RESET_MS = 5000;
const FEEDBACK_TIMING_THRESHOLD_MS = 2500;

function clearFeedbackHelperResetTimer() {
  if (feedbackHelperResetTimer) {
    clearTimeout(feedbackHelperResetTimer);
    feedbackHelperResetTimer = null;
  }
}

function setFeedbackHelper(
  message,
  tone = 'default',
  resetAfterMs = 0
) {
  if (!feedbackHelper) return;

  clearFeedbackHelperResetTimer();

  feedbackHelper.textContent = message;

  feedbackHelper.classList.remove(
    'feedback-error',
    'feedback-success',
    'feedback-warning'
  );

  if (tone === 'error') {
    feedbackHelper.classList.add('feedback-error');
  }

  if (tone === 'success') {
    feedbackHelper.classList.add('feedback-success');
  }

  if (tone === 'warning') {
    feedbackHelper.classList.add('feedback-warning');
  }

  if (resetAfterMs > 0) {
    feedbackHelperResetTimer = setTimeout(() => {
      setFeedbackHelper(FEEDBACK_DEFAULT_HELPER);
    }, resetAfterMs);
  }
}

function closeFeedbackWidget({
  preserveDraft = true,
} = {}) {
  feedbackIsOpen = false;

  feedbackWidget?.classList.remove('is-open');
  feedbackToggle?.setAttribute('aria-expanded', 'false');

  if (feedbackContent) {
    hide(feedbackContent);
  }

  if (!preserveDraft && feedbackText) {
    feedbackText.value = '';
  }
}

function openFeedbackWidget() {
  feedbackIsOpen = true;

  feedbackWidget?.classList.add('is-open');
  feedbackToggle?.setAttribute('aria-expanded', 'true');

  show(feedbackContent);
}

function setFeedbackPageType(pageType) {
  closeFeedbackWidget({
    preserveDraft: true,
  });

  const mount =
    pageType === 'results'
      ? feedbackResultsMount
      : feedbackLandingMount;

  if (
    feedbackWidget &&
    mount &&
    feedbackWidget.parentElement !== mount
  ) {
    mount.appendChild(feedbackWidget);
  }
}

function isFeedbackTooFast() {
  const now = Date.now();

  const pageLoadTooFast =
    Number.isFinite(feedbackPageLoadedAt) &&
    now - feedbackPageLoadedAt <
      FEEDBACK_TIMING_THRESHOLD_MS;

  const focusTooFast =
    Number.isFinite(feedbackFocusedAt) &&
    now - feedbackFocusedAt <
      FEEDBACK_TIMING_THRESHOLD_MS;

  return pageLoadTooFast || focusTooFast;
}

function setFeedbackSubmitting(isSubmitting) {
  feedbackSubmitting = isSubmitting;

  if (feedbackSend) {
    feedbackSend.disabled = isSubmitting;

    feedbackSend.innerHTML = isSubmitting
      ? '<span class="btn-spinner"></span> Sending…'
      : 'Send';
  }

  if (feedbackText) {
    feedbackText.disabled = isSubmitting;
  }
}

async function submitFeedback() {
  if (!feedbackText || feedbackSubmitting) return;

  const feedback = feedbackText.value.trim();

  if (!feedback) {
    setFeedbackHelper(
      FEEDBACK_EMPTY_MESSAGE,
      'error',
      FEEDBACK_HELPER_RESET_MS
    );
    return;
  }

  if (isFeedbackTooFast()) {
    setFeedbackHelper(
      FEEDBACK_TOO_FAST_MESSAGE,
      'warning',
      FEEDBACK_HELPER_RESET_MS
    );
    return;
  }

  clearFeedbackHelperResetTimer();
  setFeedbackHelper(FEEDBACK_DEFAULT_HELPER);
  setFeedbackSubmitting(true);

  try {
    const response = await fetch(
      `${API_BASE}/api/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          website: feedbackWebsite?.value || '',
          pageLoadedAt: feedbackPageLoadedAt,
          focusedAt: feedbackFocusedAt,
        }),
      }
    );

    const payload =
      await response.json().catch(() => ({}));

            if (response.ok && payload.success) {
      setFeedbackHelper(
        FEEDBACK_SUCCESS_MESSAGE,
        'success',
        FEEDBACK_HELPER_RESET_MS
      );

      feedbackText.value = '';
      return;
    }

    if (response.status === 429) {
      if (hasValidLockoutResetAt(payload)) {
        enterServerRateLimitState(payload);
        setFeedbackHelper(
          FEEDBACK_FAILURE_MESSAGE,
          'warning',
          FEEDBACK_HELPER_RESET_MS
        );
        return;
      }

      // Malformed/anomalous 429 with no authoritative lockout timestamp:
      // fall through to the generic failure message below, same as any
      // other malformed 429 in this app. Must never invent a client-side
      // lockout or disable the send button for this case.
    }

                    if (
      response.status === 422 &&
      payload.code === 'too-fast'
    ) {
      setFeedbackHelper(
        FEEDBACK_TOO_FAST_MESSAGE,
        'warning',
        FEEDBACK_HELPER_RESET_MS
      );
      return;
    }

    if (
      response.status === 400 &&
      payload.code === 'empty-feedback'
    ) {
      setFeedbackHelper(
        FEEDBACK_EMPTY_MESSAGE,
        'error',
        FEEDBACK_HELPER_RESET_MS
      );
      return;
    }

    setFeedbackHelper(
      FEEDBACK_FAILURE_MESSAGE,
      'warning',
      FEEDBACK_HELPER_RESET_MS
    );
  } catch {
    setFeedbackHelper(
      FEEDBACK_FAILURE_MESSAGE,
      'warning',
      FEEDBACK_HELPER_RESET_MS
    );
  } finally {
    setFeedbackSubmitting(false);
  }
}

if (
  feedbackWidget &&
  feedbackForm &&
  feedbackToggle &&
  feedbackText
) {
  setFeedbackPageType('landing');

  feedbackToggle.addEventListener('click', () => {
    if (feedbackSubmitting) return;

    if (feedbackIsOpen) {
      closeFeedbackWidget({
        preserveDraft: true,
      });
    } else {
      openFeedbackWidget();
    }
  });

  feedbackText.addEventListener('focus', () => {
    feedbackFocusedAt = Date.now();
  });

  feedbackText.addEventListener('input', () => {
    setFeedbackHelper(
      FEEDBACK_DEFAULT_HELPER
    );
  });

  feedbackForm.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      void submitFeedback();
    }
  );
}