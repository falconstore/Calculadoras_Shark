const CACHE_NAME = 'shark-calc-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/arbipro-styles.css',
  '/css/calculator-styles.css',
  '/css/freepro-styles.css',
  '/js/app-config.js',
  '/js/arbipro.js',
  '/js/casas-regulamentadas.js',
  '/js/freepro-content.js',
  '/js/helpers.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
