const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
// Compute base path so assets work under subpaths (e.g., GitHub Pages)
const BASE_PATH = new URL('./', self.location).pathname; // e.g., '/repo/' or '/'
const STATIC_ASSETS = [
  '',
  'index.html',
  'app.js',
  'data/phrases.js',
  'manifest.webmanifest',
  'assets/favicon.svg',
  'assets/safari-pinned-tab.svg',
].map((p) => BASE_PATH + p);

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static; network with fallback for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Static assets (cache-first)
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Default: try network, fall back to cache; update dynamic cache when online
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});


