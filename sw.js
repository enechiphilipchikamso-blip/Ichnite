// ── SolTrace Service Worker ──
// IMPORTANT: Change CACHE_VERSION every time you modify any file
// e.g. v1 → v2 → v3 and so on — this forces the browser to update
const CACHE_VERSION = 'soltrace-v3';

// ── Files to cache for offline use ──
const CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/offline.html',
  '/images/logo.png',
  '/images/sol-logo.png',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// ── Install Event ──
// Opens cache and stores all files listed above
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        // Force new service worker to activate immediately
        // without waiting for old tabs to close
        return self.skipWaiting();
      })
  );
});

// ── Activate Event ──
// Deletes all old caches that don't match current version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_VERSION)
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all open pages immediately
        return self.clients.claim();
      })
  );
});

// ── Fetch Event ──
// Network first for API calls — Cache first for static files
self.addEventListener('fetch', (event) => {

  const url = new URL(event.request.url);

  // ── API calls — always network first ──
  // Never cache live Solana or CoinGecko data
  const isApiCall =
    url.hostname.includes('mainnet-beta.solana.com') ||
    url.hostname.includes('helius-rpc.com') ||
    url.hostname.includes('api.coingecko.com') ||
    url.hostname.includes('api.shyft.to') ||
    url.hostname.includes('api.mainnet-beta.solana.com');

  if (isApiCall) {
    // Network only for live blockchain data — never cache
    event.respondWith(fetch(event.request));
    return;
  }

  // ── Static files — cache first, network fallback ──
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }

        // Not in cache — fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response for future use
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_VERSION)
                .then((cache) => {
               return cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
          if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
          }

           return new Response('', {
           status: 404,
           statusText: 'Offline'
          });
      });
     })
  );
});

// ── Message Event ──
// Allows app.js to trigger skipWaiting when update is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});