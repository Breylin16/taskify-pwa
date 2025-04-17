const CACHE_NAME = 'taskify-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/login.js',
  '/tasks.js',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
    // 1. Solo manejar solicitudes HTTP/HTTPS (ignorar chrome-extension:, etc)
    if (!event.request.url.startsWith('http')) return;
  
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // 2. Si existe en caché, devolverlo
          if (cachedResponse) {
            return cachedResponse;
          }
  
          // 3. Si no está en caché, hacer fetch y cachear (solo para GET)
          if (event.request.method === 'GET') {
            return fetch(event.request)
              .then((networkResponse) => {
                // Clonar la respuesta para cachear
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
                return networkResponse;
              })
              .catch(() => {
                // 4. Fallback para HTML (páginas)
                if (event.request.headers.get('accept').includes('text/html')) {
                  return caches.match('/offline.html');
                }
                // 5. Fallback genérico para otros recursos
                return new Response('Recurso no disponible offline', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({ 'Content-Type': 'text/plain' })
                });
              });
          }
  
          // 6. Para métodos no-GET (POST, etc), simplemente hacer fetch
          return fetch(event.request);
        })
    );
  });