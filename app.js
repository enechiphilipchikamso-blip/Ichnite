// ════════════════════════════════════════
// ── Ichnite app.js ──
// Frontend JavaScript — connects to server.js backend
// Never calls external APIs directly — all calls go through /api routes
// ════════════════════════════════════════

'use strict';

// ════════════════════════════════════════
// ── 1. CONFIGURATION — named constants frozen ──
// Improvement 7: Named constants and freeze configuration objects
// ════════════════════════════════════════

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
});

// ════════════════════════════════════════
// ── 2. COINGECKO VERIFIED COIN IDs ──
// Improvement 3: Use CoinGecko actual Coin IDs
// Verified from coingecko.com URLs
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
// Improvement 2: Store SOL balance and price in variables
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
let allTransactions = [];
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
let inputValidTimeout = null;
let failedFetchCount = 0;
let lastRateLimitInfo = null;
let rateLimitedUntil = null;
let rateLimitTickInterval = null;


// Improvement 1: AbortController — cancel stale requests
let currentAbortController = null;

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
const solPriceRow = document.getElementById('solPriceRow');
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
const wrapper = document.querySelector('.select-wrapper');
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
const accordionBtns = document.querySelectorAll('.accordion-btn');
const infoAccordions = document.querySelectorAll('.accordion.full-width');

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

function calculateWalletAge(transactions) {
  if (!transactions || transactions.length === 0) return null;
  const timestamps = transactions.map(tx => tx.timestamp || tx.blockTime).filter(Boolean);
  if (timestamps.length === 0) return null;
  const oldest = Math.min(...timestamps);
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

// Improvement 3: Get verified CoinGecko ID by symbol
function getCoinGeckoId(symbol) {
  return COINGECKO_IDS[symbol?.toUpperCase()] || null;
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

function showCopySuccess(btn, originalHTML) {
  btn.innerHTML = '<i class="fa-solid fa-check"></i>';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.classList.remove('copied');
  }, CONFIG.COPY_RESET_DELAY);
}

function hideAllMessages() {
  hide(errorMsg);
  hide(networkErrorMsg);
  hide(emptySearchMsg);
}

const RATE_LIMIT_UNLOCK_BUFFER_MS = 1200; // absorbs clock drift + 1s tick granularity + one round trip

function startRateLimitCountdown(seconds) {
  clearInterval(rateLimitTickInterval);
  rateLimitedUntil = Date.now() + seconds * 1000;
  searchBtn.disabled = true;
  hideAllMessages();
  const msgEl = document.getElementById('rateLimitMsg');
  show(msgEl);

  const tick = () => {
    const remaining = Math.max(0, Math.ceil((rateLimitedUntil - Date.now()) / 1000));
    const m = Math.floor(remaining / 60);
    const s = String(remaining % 60).padStart(2, '0');
    msgEl.textContent = `You've reached your limit. Please try again in ${m}:${s}`;
    // Display can hit 0:00 slightly before we actually unlock — the extra buffer
    // means a click right at "0:00" can no longer land inside the server's window.
    if (Date.now() >= rateLimitedUntil + RATE_LIMIT_UNLOCK_BUFFER_MS) {
      clearInterval(rateLimitTickInterval);
      hide(msgEl);
      searchBtn.disabled = false;
      rateLimitedUntil = null;
    }
  };
  tick();
  rateLimitTickInterval = setInterval(tick, 1000);
}

async function checkRateLimitGate() {
  try {
    const res = await fetch(`${API_BASE}/api/sol-price`);
    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      const retryAfter = Number(body.retryAfterSeconds);
      const fallbackSeconds = 15 * 60; // matches server windowMs — used only if retryAfterSeconds is missing/malformed
      const secondsToUse = Number.isFinite(retryAfter) && retryAfter >= 0 ? retryAfter : fallbackSeconds;
      startRateLimitCountdown(secondsToUse);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Improvement 10: Differentiate offline and server errors
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
  } else if (type === 'notfound') {
    networkErrorMsg.textContent = 'Wallet data not found.';
    show(networkErrorMsg);
  } else if (type === 'solana-delay') {
    networkErrorMsg.textContent = 'Solana network is experiencing delays. Please try again shortly.';
    show(networkErrorMsg);
  } else if (customMessage) {
    networkErrorMsg.textContent = customMessage;
    show(networkErrorMsg);
  }
}

// Improvement 10: Parse response status to show correct error
async function handleResponse(response) {
  if (response.ok) return response.json();
  if (response.status === 429) {
    const body = await response.json().catch(() => ({}));
    lastRateLimitInfo = { retryAfterSeconds: body.retryAfterSeconds || 0 };
    throw { type: 'ratelimit' };
  }
  if (response.status === 404) throw { type: 'notfound' };
  throw { type: 'solana-delay' };
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
    const chip = document.createElement('button');
    chip.className = 'history-chip';
    chip.textContent = truncateAddress(address);
    chip.title = address;
    chip.addEventListener('click', () => {
      walletInput.value = address;
      handleSearch();
    });
    
    let pressTimer = null;
    chip.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => showRemoveConfirm(address), 250);
    });
    chip.addEventListener('touchend', () => clearTimeout(pressTimer));
    chip.addEventListener('touchmove', () => clearTimeout(pressTimer));
    
    historyChips.appendChild(chip);
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

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-confirm-btn';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    let history = getSearchHistory().filter(a => a !== addressToRemove);
    localStorage.setItem('IchniteHistory', JSON.stringify(history));
    renderSearchHistory();
    document.body.removeChild(overlay);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'remove-confirm-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => document.body.removeChild(overlay));

  card.appendChild(text);
  card.appendChild(removeBtn);
  card.appendChild(cancelBtn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ════════════════════════════════════════
// ── 10. SKELETON MANAGEMENT ──
// ════════════════════════════════════════

function showAllSkeletons() {
  infoAccordions.forEach(el => hide(el));
  show(resultsSection);
  document.getElementById('netWorthError')?.remove();
  document.getElementById('netWorthEmpty')?.remove();
  document.getElementById('netWorthPending')?.remove();
  show(totalNetWorth);
  show(netWorthSkeleton);
  show(netWorthLabel);
  hide(netWorthValue);
  show(solSkeleton);
  hide(document.getElementById('solMarketSection'));
  hide(document.getElementById('walletAgeRow'));
  hide(solBalanceRow);
  hide(document.getElementById('solEmptyMsg'));
  document.getElementById('solCardFullError')?.remove();
  show(tokenSkeleton);
  show(tokenTotalSkeleton);
  hide(tokenList);
  hide(tokenTotalValue);
  hide(document.getElementById('tokenScrollFade'));
  hiddenTokenIds.clear();
  removePieHiddenIndicators();
  document.getElementById('pieLegendCustom')?.replaceChildren();;
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
  show(txSkeleton);
  hide(last7txList);
}

function hideSkeletonShowContent(skeletonEl, ...contentEls) {
  hide(skeletonEl);
  contentEls.forEach(el => show(el));
}

// ════════════════════════════════════════
// ── 11. SEARCH BUTTON STATE ──
// ════════════════════════════════════════

function setSearchLoading(isLoading) {
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

// ════════════════════════════════════════
// ── 12. CLEAR / RESET ──
// ════════════════════════════════════════

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
  allTransactions = [];
  hideAllMessages();
  hide(resultsSection);
  hide(walletDisplay);
  hide(clearBtn);
  hide(totalNetWorth);
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
  document.title = 'Ichnite';
  toggleBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.style.transform = '';
  });
  document.querySelector('[data-range="days"]')?.classList.add('active');
  hide(yearDropdown);
  currentBarRange = 'days';
  currentYearSelection = 1;
  yearRangeActive = false;
  if (yearToggleBtn) yearToggleBtn.textContent = 'Year';
  yearOptions.forEach(opt => opt.classList.remove('selected'));
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
  if (rateLimitedUntil) {
    return; // still locked out — the countdown message is already visible, nothing more to do
  }

  if (!navigator.onLine) {
    showError('offline');
    return;
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

  // Improvement 1: Abort previous request if still running
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  
  if (await checkRateLimitGate()) return;

  lastSearchTime = now;
  currentWalletAddress = rawAddress;
  walletInput.classList.add('input-valid');
  walletInput.classList.remove('input-error');
  hideAllMessages();

  clearTimeout(inputValidTimeout);
  inputValidTimeout = setTimeout(() => {
    walletInput.classList.remove('input-valid');
  }, 5000);
  setSearchLoading(true);
  showAllSkeletons();
  if (tokenSearch) tokenSearch.value = '';
  
  
    /* resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); */
  document.title = 'Ichnite - Wallet Results..';
  truncatedAddressEl.textContent = truncateAddress(currentWalletAddress);
  show(walletDisplay);
  show(clearBtn);
  solscanLink.href = `https://solscan.io/account/${currentWalletAddress}`;
  saveToHistory(currentWalletAddress);
  hide(searchHistory);
  walletInput.blur();

  if (liveUpdateInterval) { clearInterval(liveUpdateInterval); liveUpdateInterval = null; }

  try {
    solFetchFailed = false;
    tokenFetchFailed = false;
    barDataAvailable = false;
    tokenDataAvailable = false;
    netWorthRevealed = false;
    tokenCardRevealed = false;
    barCardRevealed = false;
    solBalanceFailed = false;
    solPriceFailed = false;
    solAgeFailed = false;
    failedFetchCount = 0;
    lastRateLimitInfo = null;
    
  await Promise.allSettled([
      fetchSolBalance(currentWalletAddress),
      fetchTokens(currentWalletAddress),
      fetchNFTs(currentWalletAddress),
      fetchTransactions(currentWalletAddress),
    ]);
    updateNetWorth();
    if (lastRateLimitInfo) {
      startRateLimitCountdown(lastRateLimitInfo.retryAfterSeconds);
    } else if (failedFetchCount >= 4) {
      showError('server');
    }
    // Already handled above using failedFetchCount.
    
    } finally {
  setSearchLoading(false);
  currentAbortController = null;
    }

  liveUpdateInterval = setInterval(() => {
    if (currentWalletAddress) fetchLivePrices(currentWalletAddress);
  }, CONFIG.LIVE_UPDATE_INTERVAL);
}

// ════════════════════════════════════════
// ── 15. SOL BALANCE ──
// Improvement 2: Store SOL price and balance in variables
// ════════════════════════════════════════

async function fetchSolBalance(address) {
  document.getElementById('solBalanceError')?.remove();
  document.getElementById('solPriceError')?.remove();
  document.getElementById('solCardFullError')?.remove();
  const signal = currentAbortController?.signal;

  const [priceResult, balanceResult] = await Promise.allSettled([
    fetch(`${API_BASE}/api/sol-price`, { signal }),
    fetch(`${API_BASE}/api/sol-balance?address=${address}`, { signal }),
  ]);

  if (signal?.aborted) return; // superseded by a newer call — that call owns the UI now

  const priceUnreachable = priceResult.status === 'rejected';
  const balanceUnreachable = balanceResult.status === 'rejected';

  hide(solSkeleton);

  // Both requests failed at the NETWORK level — backend itself is unreachable.
  // Treat as one full-card failure, skip all per-section granularity entirely.
  if (priceUnreachable && balanceUnreachable) {
    solBalanceFailed = true;
    solPriceFailed = true;
    solFetchFailed = true; // legacy flag — still read by updateNetWorth()
    failedFetchCount++;

    hide(solBalanceRow);
    hide(document.getElementById('solEmptyMsg'));
    hide(document.getElementById('solMarketSection'));
    hide(document.getElementById('walletAgeRow'));

    const err = document.createElement('p');
    err.id = 'solBalanceError';
    err.className = 'empty-msg';
    err.textContent = 'Unable to load SOL balance';
    solBalanceRow.insertAdjacentElement('afterend', err);

    revealCard(solBalanceRow.closest('.card'));
    return;
  }

// Past this point, the backend IS reachable — per-section logic applies.
  // solFetchFailed is computed at the END of this function, once both
  // sections have actually been evaluated — not forced false here.

  // ── Balance section ──
  if (balanceResult.status === 'fulfilled' && balanceResult.value.ok) {
    const balanceData = await balanceResult.value.json();
    currentSolBalance = balanceData.balance || 0;
    solBalanceFailed = false;

    // Load SOL logo
    if (solLogo?.dataset.src) solLogo.src = solLogo.dataset.src;

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
    err.textContent = 'Unable to load SOL balance';
    solBalanceRow.insertAdjacentElement('afterend', err);
  }

  // ── Market section — one shared placeholder, not per-value ──
  show(document.getElementById('solMarketSection'));
  const marketPlaceholder = document.getElementById('solMarketUnavailable');
  const marketValuesRow1 = document.getElementById('solMarketPriceRow');
  const marketValuesRow2 = document.getElementById('solMarketChangeRow');

  if (priceResult.status === 'fulfilled' && priceResult.value.ok) {
    const priceData = await priceResult.value.json();
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
  }

  revealCard(solBalanceRow.closest('.card'));
  solFetchFailed = solBalanceFailed && solPriceFailed;
}

// ════════════════════════════════════════
// ── 16. TOKEN HOLDINGS ──
// Improvement 3: Use verified CoinGecko IDs
// ════════════════════════════════════════

async function fetchTokens(address) {
  try {
    const signal = currentAbortController?.signal;
    const res = await fetch(`${API_BASE}/api/tokens?address=${address}`, { signal });
    const data = await handleResponse(res);
    allTokens = data.tokens || [];

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
    
    
    // Amounts, metadata, and prices all arrive together — no separate price fetch needed
    tokenDataAvailable = true;
    renderTokenList();

  } catch (error) {
    tokenFetchFailed = true;
    if (error?.name === 'AbortError') return;
    tokenDataAvailable = false;
    failedFetchCount++;
    console.error('Token error:', error);
    hideSkeletonShowContent(tokenSkeleton, tokenList);
    hide(tokenTotalSkeleton);
    hide(pieSkeleton);
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'Unable to load token holdings';
    tokenList.replaceChildren(msg);
    
  }
}

async function fetchTokenPrices(tokens) {
  let priceFetchSucceeded = false;
  try {
    // Only send tokens with a verified CoinGecko ID — never guess.
    // Unknown tokens simply show $0.00 rather than risking a 400 for everyone.
    const ids = tokens
      .map(t => getCoinGeckoId(t.symbol))
      .filter(Boolean);

    const allIds = [...new Set(ids)].join(',');
    if (!allIds) return;

    const res = await fetch(`${API_BASE}/api/token-prices?ids=${encodeURIComponent(allIds)}`, 
      {  signal: currentAbortController?.signal,  }
    );
    if (!res.ok) throw new Error('Price API error');
    tokenPrices = await res.json();
    const data = await res.json();
tokenPrices = data && typeof data === 'object' ? data : {};
    priceFetchSucceeded = true;
  } catch (error) {
    if (error.name === 'AbortError') return false;
    console.warn('Token prices unavailable, keeping last known prices:', error);
    // Do NOT wipe tokenPrices — keep last known good values instead of resetting to $0.00
      }
      return priceFetchSucceeded;
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
  tokenTotalValue.textContent = formatUSD(totalValue);
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
function renderTokenList(options = {}) {
  updateTokenTotalsAndChart(allTokens, options);
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

function openTokenSortOverlay() {
  const options = [
    { value: 'value', label: 'Sort by Value' },
    { value: 'amount', label: 'Sort by Amount' },
    { value: 'name', label: 'Sort by Name' },
  ];
  const currentValue = tokenSort.dataset.value || 'value';
  const arrowEl = document.getElementById('tokenSortArrow');
  const labelEl = document.getElementById('tokenSortLabel');

    const existingOverlay = document.querySelector('.sort-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
    
  const overlay = document.createElement('div');
  overlay.className = 'sort-overlay';

  const card = document.createElement('div');
  card.className = 'sort-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-label', 'Token sorting options');

  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      overlay.remove();
      tokenSort.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', handleEscape);
    }
  };
  
  options.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'sort-option' + (opt.value === currentValue ? ' selected' : '');

    const label = document.createElement('span');
    label.textContent = opt.label;

    const radio = document.createElement('span');
    radio.className = 'sort-option-radio';

    row.appendChild(label);
    row.appendChild(radio);

    row.addEventListener('click', () => {
      tokenSort.dataset.value = opt.value;
      if (labelEl) labelEl.textContent = opt.label;
      arrowEl?.classList.remove('open');
      tokenSort.setAttribute('aria-expanded', 'false');
      overlay.remove();
      renderVisibleTokenRows();
    });

    card.appendChild(row);
  });

  overlay.appendChild(card);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      arrowEl?.classList.remove('open');
      tokenSort.setAttribute('aria-expanded', 'false');
    }
  });

  document.body.appendChild(overlay);
  arrowEl?.classList.add('open');
  tokenSort.setAttribute('aria-expanded', 'true');
}

// ════════════════════════════════════════
// ── 17. PIE CHART ──
// Improvement 4: Update chart instead of recreating when possible
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
// Improvement 5 and 6: createElement and addEventListener
// ════════════════════════════════════════

async function fetchNFTs(address) {
  try {
    const signal = currentAbortController?.signal;
    const res = await fetch(`${API_BASE}/api/nfts?address=${address}`, { signal });
    const data = await handleResponse(res);
    const nfts = data.nfts || [];

    if (nfts.length === 0) {
      nftGrid.replaceChildren(); // clear stale images from a previous successful search
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
  if (error?.name === 'AbortError') return;

  failedFetchCount++;

  console.error('NFT error:', error);
  console.error('NFT error message:', error?.message);
  console.error('NFT error stack:', error?.stack);

  nftGrid.replaceChildren();
  nftList.replaceChildren();

  hideSkeletonShowContent(nftSkeleton, nftList, nftGrid);

  const msg = document.createElement('p');
  msg.className = 'empty-msg';
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
    const image = nft.content?.links?.image || nft.content?.files?.[0]?.uri || nft.image || '';

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
      // Improvement 9: Use backend token logo fallback
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
// Improvement 5 and 6: createElement and addEventListener
// ════════════════════════════════════════

async function fetchTransactions(address) {
  document.getElementById('barChartError')?.remove();
  document.getElementById('barChartEmpty')?.remove();
  try {
    const signal = currentAbortController?.signal;
    const res = await fetch(`${API_BASE}/api/transactions?address=${address}`, { signal });
    const data = await handleResponse(res);
    allTransactions = data.transactions || [];

    const age = calculateWalletAge(allTransactions);
    if (age) {
      walletAgeEl.textContent = age;
      solAgeFailed = false;
      show(document.getElementById('walletAgeRow'));
    }

    if (allTransactions.length === 0) {
      barDataAvailable = false;
      hide(barSkeleton);
      hide(barChart);
      barChart.closest('.chart-scroll-wrapper')?.classList.remove('chart-reserved');
      const noActivityMsg = document.createElement('p');
      noActivityMsg.id = 'barChartEmpty';
      noActivityMsg.className = 'empty-msg';
      noActivityMsg.textContent = 'This wallet has no chart activity';
      barChart.closest('.chart-scroll-wrapper')?.appendChild(noActivityMsg);
    } else {
      barDataAvailable = true;
      renderBarChart(allTransactions, currentBarRange, currentYearSelection);
    }

    renderRecentTransactions(allTransactions);
    

  } catch (error) {
    if (error?.name === 'AbortError') return;
    solAgeFailed = true;
    walletAgeEl.textContent = 'Age unavailable';
    show(document.getElementById('walletAgeRow'));
    barDataAvailable = false;
    failedFetchCount++;
    console.error('Transaction error:', error);
    hide(barSkeleton);
    hide(barChart);
    barChart.closest('.chart-scroll-wrapper')?.classList.remove('chart-reserved');
    const barErrorMsg = document.createElement('p');
    barErrorMsg.id = 'barChartError';
    barErrorMsg.className = 'empty-msg';
    barErrorMsg.textContent = 'Unable to load wallet activity chart';
    barChart.closest('.chart-scroll-wrapper')?.appendChild(barErrorMsg);
    hideSkeletonShowContent(txSkeleton, last7txList);
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'Unable to load transactions';
    last7txList.replaceChildren(msg);
    
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

async function renderRecentTransactions(transactions) {
  const txMints = [...new Set(
    transactions
      .flatMap(tx => tx.tokenTransfers?.map(t => t.mint) || [])
      .filter(Boolean)
  )];
  let txTokenMetadata = new Map();
  if (txMints.length > 0) {
    try {
      const res = await fetch(`${API_BASE}/api/token-metadata?mints=${txMints.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        txTokenMetadata = new Map(Object.entries(data.metadata || {}));
      }
    } catch { /* fall through to mint-address display */ }
  }
  if (!transactions || transactions.length === 0) {
    hideSkeletonShowContent(txSkeleton, last7txList);
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'This wallet has no transactions yet';
    last7txList.replaceChildren(msg);
    return;
  }

  const recent = transactions.slice(0, CONFIG.MAX_RECENT_TX);
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

      // Copy signature button — Improvement 6: addEventListener not onclick
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-sig-btn';
      copyBtn.title = 'Copy transaction signature';
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';

      const signature = tx.signature || '';
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
  if (!barCardRevealed) {
    revealCard(last7txList.closest('.card'));
    barCardRevealed = true;
  }
}

// ════════════════════════════════════════
// ── 20. BAR CHART ──
// Improvement 4: Update chart instead of recreating
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

    // Improvement 4: Update existing bar chart instead of recreating
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
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
            grid: { display: true, drawOnChartArea: true, color: 'rgba(124, 92, 252, 0.1)' },
            ticks: { color: '#7c5cfc', font: { family: 'Space Grotesk', size: 11 }, stepSize: 1, beginAtZero: true },
            border: { display: false },
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
    toggleBtns.forEach(b => { b.classList.remove('active'); b.style.transform = ''; });
    btn.classList.add('active');
    btn.style.transform = 'scale(1.15)';

    if (range === 'year') {
      const isOpen = !yearDropdown.classList.contains('hidden');
      if (isOpen) {
        hide(yearDropdown);
        if (yearRangeActive) {
          // A year was already picked — keep it active, don't touch the chart
          btn.classList.add('active');
          btn.style.transform = 'scale(1.15)';
        } else {
          // Dropdown closed without ever picking a year — no chart change needed,
          // it was never altered in the first place
          btn.style.transform = '';
          btn.classList.remove('active');
        }
      } else {
        yearOptions.forEach(opt => {
          opt.classList.toggle('selected', parseInt(opt.dataset.year) === currentYearSelection && yearRangeActive);
        });
        show(yearDropdown);
      }
    } else {
      yearRangeActive = false;
      hide(yearDropdown);
      if (yearToggleBtn) yearToggleBtn.textContent = 'Year';
      yearOptions.forEach(opt => opt.classList.remove('selected'));
      currentBarRange = range;
      renderBarChart(allTransactions, range, currentYearSelection);
    }
  });
});

yearOptions.forEach(option => {
  option.addEventListener('click', () => {
    if (!barDataAvailable) return;

    currentYearSelection = parseInt(option.dataset.year);
    currentBarRange = 'year';
    yearRangeActive = true;
    hide(yearDropdown);
    if (yearToggleBtn) yearToggleBtn.textContent = `${currentYearSelection} Year${currentYearSelection > 1 ? 's' : ''}`;
    renderBarChart(allTransactions, 'year', currentYearSelection);
  });
});

// ════════════════════════════════════════
// ── 22. WALLET TOTAL NET WORTH ──
// Improvement 2: Use stored variables — no duplicate API call
// ════════════════════════════════════════

function updateNetWorth() {
  document.getElementById('netWorthError')?.remove();
  document.getElementById('netWorthEmpty')?.remove();


  // Genuinely empty portfolio — both fetches succeeded, wallet just holds nothing.
  // Distinct from a failure state: nothing went wrong, there's simply no value to show.
  if (!solFetchFailed && !tokenFetchFailed && currentSolBalance === 0 && allTokens.length === 0) {
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthEmpty';
    msg.className = 'empty-msg';
    msg.textContent = 'This wallet has no assets';
    totalNetWorth.appendChild(msg);
    return;
  }

  // Wallet holds real tokens but none are priced yet, and has 0 SOL —
  // re-evaluated on every call, so this clears itself automatically once
  // live pricing resolves for any of them
  if (
    !solFetchFailed && !tokenFetchFailed &&
    currentSolBalance === 0 && allTokens.length > 0 &&
    allTokens.every(t => t.priceUnavailable)
  ) {
    document.getElementById('netWorthEmpty')?.remove();
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthPending';
    msg.className = 'empty-msg';
    msg.textContent = `Value pending — ${allTokens.length} token${allTokens.length > 1 ? 's' : ''} held, pricing pending`;
    totalNetWorth.appendChild(msg);
    return;
  }
  
  document.getElementById('netWorthPending')?.remove();

  if (solFetchFailed && tokenFetchFailed) {
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthError';
    msg.className = 'empty-msg';
    msg.textContent = 'Unable to load total net worth';
    totalNetWorth.appendChild(msg);
    return;
  }
  
  // Use stored state variables — no extra API call needed
  
  try {
    const solValueUSD = currentSolBalance * currentSolPrice;
    const tokenTotal = allTokens.reduce((sum, t) => sum + getTokenUsdValue(t), 0);
    const total = solValueUSD + tokenTotal;

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
    netWorthValue.textContent = 'Unable to load total net worth';
    show(netWorthLabel);
    show(netWorthValue);
  }
}

// ════════════════════════════════════════
// ── 23. LIVE PRICE UPDATES ──
// ════════════════════════════════════════

async function fetchLivePrices() {
  try {
    const res = await fetch(`${API_BASE}/api/sol-price`);
    if (res.ok) {
      const priceData = await res.json();
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
    
   }  else {
      solPriceFailed = true;
      hide(document.getElementById('solMarketPriceRow'));
      hide(document.getElementById('solMarketChangeRow'));
      show(document.getElementById('solMarketUnavailable'));
    }

    // Live Jupiter-only price refresh — Raydium deliberately excluded here per its
// own docs ("not suitable for real-time tracking"); Raydium only runs once,
// at initial search time, via the full /api/tokens route.
    if (allTokens.length > 0) {
      const mintList = allTokens.map(t => t.mint).filter(Boolean);
      const priceRes = await fetch(`${API_BASE}/api/token-prices-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mints: mintList }),
      });
      if (priceRes.ok) {
        const { prices, unpriced } = await priceRes.json();
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
        if (updated) renderTokenList({ skipSpinner: true });
      }
    }

    updateNetWorth();
  } catch (error) {
  if (error.name === 'AbortError') return;

  liveUpdateFailures++;

  if (liveUpdateFailures >= 5) {
    clearInterval(liveUpdateInterval);
    liveUpdateInterval = null;
    console.warn('Live updates stopped after repeated failures.');
    return;
  }

  console.warn('Live update failed:', error);
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
  shareWalletBtn.addEventListener('click', async () => {
    if (!currentWalletAddress) return;
    const shareUrl = `${window.location.origin}?wallet=${currentWalletAddress}`;
    await copyToClipboard(shareUrl);
    const originalText = shareWalletBtn.textContent;
    shareWalletBtn.textContent = '✓ Link copied!';
    setTimeout(() => { shareWalletBtn.textContent = originalText; }, CONFIG.COPY_RESET_DELAY);
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
  });
});

// ════════════════════════════════════════
// ── 30. OFFLINE DETECTION ──
// Improvement 10: Differentiate offline from server errors
// ════════════════════════════════════════

window.addEventListener('offline', () => {
  showError('offline');
});

window.addEventListener('online', () => {
  hide(networkErrorMsg);
  if (currentWalletAddress) fetchLivePrices();
});

// ════════════════════════════════════════
// ── 31. INITIALIZATION ──
// ════════════════════════════════════════

renderSearchHistory();