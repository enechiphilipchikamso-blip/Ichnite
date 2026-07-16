// ════════════════════════════════════════
// ── SolTrace app.js ──
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

const COINGECKO_IDS = Object.freeze({
  // Symbol to CoinGecko ID mapping
  SOL: 'solana',
  JUP: 'jupiter',
  JTO: 'jito',
  BONK: 'bonk',
  WIF: 'dogwifhat',
  POPCAT: 'popcat',
  PENGU: 'pudgy-penguins',
  FARTCOIN: 'fartcoin',
  AI16Z: 'ai16z',
  GIGA: 'gigachad-2',
  TRUMP: 'official-trump',
  MELANIA: 'melania-meme',
  BOME: 'book-of-meme',
  MEW: 'mew',
  PNUT: 'peanut-the-squirrel',
  DRIFT: 'drift-protocol',
  KMNO: 'kamino',
  ORCA: 'orca',
  RAY: 'raydium',
  MNDE: 'marinade',
  TNSR: 'tensor',
  W: 'wormhole',
  HNT: 'helium',
  MOBILE: 'helium-mobile',
  ARC: 'arcium',
  GRASS: 'grass',
  USDC: 'usd-coin',
  USDT: 'tether',
  PYTH: 'pyth-network',
});

// ════════════════════════════════════════
// ── 3. TOKEN BRAND COLORS ──
// ════════════════════════════════════════

const TOKEN_COLORS = Object.freeze({
  SOL: '#9945FF',
  JUP: '#24AE8F',
  JTO: '#3B82F6',
  BONK: '#F7931A',
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
  PYTH: '#8B5CF6',
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
let tokenDataAvailable = false;
let netWorthRevealed = false;
let tokenCardRevealed = false;
let inputValidTimeout = null;
let failedFetchCount = 0;


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
const barSkeleton = document.getElementById('barSkeleton');
const barSpinner = document.getElementById('barSpinner');
const barChart = document.getElementById('barChart');
const last7txList = document.getElementById('last7txList');
const txSkeleton = document.getElementById('txSkeleton');
const solscanLink = document.getElementById('solscanLink');
const accordionBtns = document.querySelectorAll('.accordion-btn');

// ════════════════════════════════════════
// ── 7. SERVICE WORKER REGISTRATION ──
// Improvement 8: Better service worker path handling
// ════════════════════════════════════════

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Derive base path dynamically for flexible deployment
    const swPath = new URL('sw.js', window.location.href).pathname;
    navigator.serviceWorker.register(swPath)
      .then(() => console.log('✅ SolTrace SW registered'))
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
    networkErrorMsg.textContent = 'SolTrace server is having issues. Please try again shortly.';
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
  if (response.status === 429) throw { type: 'ratelimit' };
  if (response.status === 404) throw { type: 'notfound' };
  // A response arriving at all means our own server responded —
  // any failure past this point is an upstream Solana/Helius issue
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
    return JSON.parse(localStorage.getItem('soltraceHistory') || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(address) {
  try {
    let history = getSearchHistory().filter(a => a !== address);
    history.unshift(address);
    history = history.slice(0, CONFIG.MAX_HISTORY);
    localStorage.setItem('soltraceHistory', JSON.stringify(history));
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
    localStorage.setItem('soltraceHistory', JSON.stringify(history));
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
  show(resultsSection);
  document.getElementById('netWorthError')?.remove();
  show(totalNetWorth);
  show(netWorthSkeleton);
  show(netWorthLabel);
  hide(netWorthValue);
  show(solSkeleton);
  hide(solPriceRow);
  hide(solBalanceRow);
  hide(walletAgeEl);
  show(tokenSkeleton);
  show(tokenTotalSkeleton);
  hide(tokenList);
  hide(tokenTotalValue);
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
  renderSearchHistory();
  /* showFloatingLogos(); */
  if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null; }
  if (barChartInstance) { barChartInstance.destroy(); barChartInstance = null; }
  if (liveUpdateInterval) { clearInterval(liveUpdateInterval); liveUpdateInterval = null; }
  document.title = 'SolTrace';
  toggleBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.style.transform = '';
  });
  document.querySelector('[data-range="days"]')?.classList.add('active');
  hide(yearDropdown);
  currentBarRange = 'days';
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
  resetInputState();
  if (navigator.onLine) {
    hideAllMessages();
  }
});

// ════════════════════════════════════════
// ── 14. MAIN SEARCH HANDLER ──
// ════════════════════════════════════════

async function handleSearch() {
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
  
  
    /* resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); */
  document.title = 'SolTrace — Wallet Results';
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
    failedFetchCount = 0;
    
  const results = await Promise.allSettled([
    fetchSolBalance(currentWalletAddress),
    fetchTokens(currentWalletAddress),
    fetchNFTs(currentWalletAddress),
    fetchTransactions(currentWalletAddress),
  ]);
  updateNetWorth();
   if (failedFetchCount >= 4) {
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
  try {
    const signal = currentAbortController?.signal;
    const [priceRes, balanceRes] = await Promise.all([
      fetch(`${API_BASE}/api/sol-price`, { signal }),
      fetch(`${API_BASE}/api/sol-balance?address=${address}`, { signal }),
    ]);

    const priceData = await handleResponse(priceRes);
    const balanceData = await handleResponse(balanceRes);

    currentSolPrice = priceData.price || 0;
    currentSolBalance = balanceData.balance || 0;
    const change = priceData.change24h || 0;
    const usdValue = currentSolBalance * currentSolPrice;

    if (solLogo?.dataset.src) solLogo.src = solLogo.dataset.src;

    solPriceEl.textContent = formatUSD(currentSolPrice);
    const changeFormatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    solPriceChange.textContent = changeFormatted;
    solPriceChange.className = 'sol-change ' + (change >= 0 ? 'gain' : 'loss');
    show(document.getElementById('solMarketSection'));

    if (currentSolBalance === 0) {
      hide(solBalanceRow);
      show(document.getElementById('solEmptyMsg'));
    } else {
      hide(document.getElementById('solEmptyMsg'));
      solBalanceEl.textContent = formatSOL(currentSolBalance);
      solBalanceUsd.textContent = formatUSD(usdValue);
      show(solBalanceRow);
    }

    hide(solSkeleton);
    revealCard(solBalanceRow.closest('.card'));

} catch (error) {
    if (error.name === 'AbortError') return;
    solFetchFailed = true;
    failedFetchCount++;
    console.error('SOL balance error:', error);
    hide(solSkeleton);
    hide(solBalanceRow);
    hide(document.getElementById('solEmptyMsg'));
    hide(document.getElementById('solMarketSection'));
    hide(document.getElementById('walletAgeRow'));
    document.getElementById('solBalanceError')?.remove();
    const solErrorMsg = document.createElement('p');
    solErrorMsg.id = 'solBalanceError';
    solErrorMsg.className = 'empty-msg';
    solErrorMsg.textContent = 'Unable to load SOL balance';
    solBalanceRow.insertAdjacentElement('afterend', solErrorMsg);
  }
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
    renderTokenList(allTokens);

  } catch (error) {
    tokenFetchFailed = true;
    if (error.name === 'AbortError') return;
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

function renderTokenList(tokens) {
  const sorted = sortTokens(tokens);

  const totalValue = sorted.reduce((sum, t) => sum + getTokenUsdValue(t), 0);
  
  hide(tokenTotalSkeleton);
  tokenTotalValue.textContent = formatUSD(totalValue);
  show(tokenTotalValue);

  const fragment = buildTokenRowsFragment(sorted);
  tokenList.replaceChildren(fragment);

  // Lazy load token logos
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
  drawPieChart(sorted, totalValue);
  updateNetWorth();
}

// Lightweight reorder — used only when the user picks a sort option.
// Skips total recalculation, pie chart redraw, and net worth recalculation
// since sorting never changes the underlying data, only its display order.
// Does nothing if no real token data has loaded yet.
function resortTokenListOnly() {
  if (!tokenDataAvailable) return;

  const sorted = sortTokens(allTokens);
  const fragment = buildTokenRowsFragment(sorted);
  tokenList.replaceChildren(fragment);

  tokenList.querySelectorAll('img[data-src]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src;
  });

  const fadeEl = document.getElementById('tokenScrollFade');
  if (sorted.length > 5) {
    show(fadeEl);
  } else {
    hide(fadeEl);
  }
}

// Lightweight filter — used only when the user types in the token search box.
// Filters the visible rows in the currently selected sort order, but skips
// total recalculation, pie chart redraw, and net worth recalculation, since
// searching never changes the underlying dataset — only what's shown.
// Does nothing if no real token data has loaded yet.
function filterTokenListOnly() {
  if (!tokenDataAvailable) return;

  const query = tokenSearch.value.toLowerCase().trim();
  const filtered = query
    ? allTokens.filter(t => t.symbol?.toLowerCase().includes(query) || t.name?.toLowerCase().includes(query))
    : allTokens;

  const sorted = sortTokens(filtered);
  const fragment = buildTokenRowsFragment(sorted);
  tokenList.replaceChildren(fragment);

  tokenList.querySelectorAll('img[data-src]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src;
  });

  const fadeEl = document.getElementById('tokenScrollFade');
  if (sorted.length > 5) {
    show(fadeEl);
  } else {
    hide(fadeEl);
  }
}

if (tokenSearch) {
  tokenSearch.addEventListener('input', () => {
    filterTokenListOnly();
  });
}

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
      resortTokenListOnly();
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

function drawPieChart(tokens, totalValue) {
  if (!tokens || tokens.length === 0) {
    hide(pieSkeleton);
    hide(pieSpinner);
    return;
  }

  hide(pieSkeleton);
  show(pieSpinner);

  const labels = tokens.map(t => t.symbol || 'Unknown');
  const values = tokens.map(t => parseFloat(t.amount) || 0); // amount is now a String — parseFloat still required, unchanged
  const colors = tokens.map(t => getTokenColor(t.symbol));
  const amountTotal = values.reduce((a, b) => a + b, 0);

  setTimeout(() => {
    hide(pieSpinner);
    show(pieChart);

    // Improvement 4: Update existing chart if it exists
    if (pieChartInstance) {
      pieChartInstance.data.labels = labels;
      pieChartInstance.data.datasets[0].data = values;
      pieChartInstance.data.datasets[0].backgroundColor = colors;
      pieChartInstance.resize();
      pieChartInstance.update();
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
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            labels: {
              color: '#7c5cfc',
              font: {
                family: 'Space Grotesk',
                size: 12,
              },
              padding: 16,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1a1a2e',
            titleColor: '#ffffff',
            bodyColor: '#7c5cfc',
            borderColor: '#7c5cfc',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label(context) {
                const token = tokens[context.dataIndex];
                const amount = values[context.dataIndex];
                const percentage = amountTotal > 0 ? ((amount / amountTotal) * 100).toFixed(1) : '0.0';
                return [
                  `Amount: ${amount.toFixed(4)}`,
                  hasKnownPrice(token) ? `Value: ${formatUSD(getTokenUsdValue(token))}` : 'Price unavailable',
                  `Share: ${percentage}%`,
                ];
              },
            },
          },
        },
      },
    });
    pieChartInstance.resize();
  }, CONFIG.CHART_DRAW_DELAY);
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
    if (error.name === 'AbortError') return;
    failedFetchCount++;
    console.error('NFT error:', error.message);
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
    if (age) { walletAgeEl.textContent = age; show(document.getElementById('walletAgeRow')); }

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
    if (error.name === 'AbortError') return;
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

function describeTransaction(tx) {
  const type = tx.type?.toUpperCase() || '';
  if (tx.description) {
    // Truncate any full Solana addresses embedded in Helius's own description
    return tx.description.replace(/[1-9A-HJ-NP-Za-km-z]{32,44}/g, (match) => truncateAddress(match));
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

function renderRecentTransactions(transactions) {
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
      textSpan.textContent = describeTransaction(tx);

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
  revealCard(last7txList.closest('.card'));
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
  show(barSpinner);

  const { labels, counts } = buildBarChartData(transactions, range, yearCount);

  setTimeout(() => {
    hide(barSpinner);
    show(barChart);

    // Improvement 4: Update existing bar chart instead of recreating
  if (barChartInstance) {
      barChartInstance.data.labels = labels;
      barChartInstance.data.datasets[0].data = counts;
      barChartInstance.resize();
      barChartInstance.update();
      revealCard(barChart.closest('.card'));
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
    revealCard(barChart.closest('.card'));
  }, CONFIG.CHART_DRAW_DELAY);
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
        btn.style.transform = '';
        btn.classList.remove('active');
        currentBarRange = 'days';
        renderBarChart(allTransactions, 'days', 1);
      } else {
        show(yearDropdown);
      }
    } else {
      hide(yearDropdown);
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
    hide(yearDropdown);
    renderBarChart(allTransactions, 'year', currentYearSelection);
  });
});

// ════════════════════════════════════════
// ── 22. WALLET TOTAL NET WORTH ──
// Improvement 2: Use stored variables — no duplicate API call
// ════════════════════════════════════════

function updateNetWorth() {
  document.getElementById('netWorthError')?.remove();

  if (solFetchFailed && tokenFetchFailed) {
    hide(netWorthSkeleton);
    hide(netWorthValue);
    const msg = document.createElement('p');
    msg.id = 'netWorthError';
    msg.className = 'empty-msg';
    msg.textContent = 'Unable to calculate';
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
    netWorthValue.textContent = 'Unable to calculate';
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
    if (!res.ok) {
  throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    const priceData = await res.json();
    liveUpdateFailures = 0;

    currentSolPrice = priceData.price || 0;
    const change = priceData.change24h || 0;

    solPriceEl.textContent = formatUSD(currentSolPrice);
    const changeFormatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    solPriceChange.textContent = changeFormatted;
    solPriceChange.className = 'sol-change ' + (change >= 0 ? 'gain' : 'loss');
    if (currentSolBalance > 0) {
      solBalanceUsd.textContent = formatUSD(currentSolBalance * currentSolPrice);
    }

    // Live Jupiter-only price refresh — Raydium deliberately excluded here per its
// own docs ("not suitable for real-time tracking"); Raydium only runs once,
// at initial search time, via the full /api/tokens route.
    if (allTokens.length > 0) {
      const mintList = allTokens.map(t => t.mint).filter(Boolean).join(',');
      const priceRes = await fetch(`${API_BASE}/api/token-prices-live?mints=${mintList}`);
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
        if (updated) renderTokenList(allTokens);
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
