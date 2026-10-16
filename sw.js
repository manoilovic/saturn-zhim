const CACHE_PREFIX = 'saturn-zhim-' + self.registration.scope + '-';
const CACHE = CACHE_PREFIX + 'v1';
const ASSETS = ['./', './app.css', './app.js', './calculator.js', './manifest.webmanifest', './icon-512.png', './icon-192.png', './apple-touch-icon.png', './favicon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () => {
      const cached = await caches.match(new URL('./', self.registration.scope).href);
      if (!cached) return Response.error();
      // Static hosts may redirect index.html to /. A redirected cached response
      // cannot satisfy a navigation with redirect mode 'manual'. Return a fresh
      // response from the cached shell to support both host URL behaviors.
      return new Response(cached.body, {status:cached.status, statusText:cached.statusText, headers:cached.headers});
    }));
  } else {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});

