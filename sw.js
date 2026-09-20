const CACHE_NAME = 'moto-tarifa-offline-v8'; // Sube este número cada vez que actualices index.html

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Instalar y forzar activación inmediata
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Borrar cachés viejos automáticamente al actualizar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptar peticiones (Funciona sin internet y guarda lo nuevo)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, lo devuelve. Si no, lo descarga y lo guarda para la próxima.
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Solo guardamos si la respuesta es válida
            if(event.request.method === 'GET' && fetchResponse.status === 200) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        }).catch(() => {
          // Si no hay internet y no está en caché, no crashea la app
        });
      })
  );
});
