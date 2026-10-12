const CACHE_NAME = 'rabochiy-calendar-v2';

self.addEventListener('install', (event) => {
  const base = new URL('./', self.registration.scope);
  const shell = [base.href, new URL('index.html', base).href, new URL('manifest.json', base).href];
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(shell)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('rabochiy-calendar-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached || caches.match(new URL('index.html', scope).href));
      return cached || network;
    })
  );
});
