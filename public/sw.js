// Service Worker com cache inteligente e atualização automática
// IMPORTANTE: não cachear bundles do Vite (/node_modules/.vite, /assets, /src), pois isso pode misturar versões
// e causar erros como "Invalid hook call" / "Cannot read properties of null (reading 'useState')".

const CACHE_VERSION = 'shark-calc-v2.2';
const CACHE_NAME = `${CACHE_VERSION}-${Date.now()}`;

// Arquivos estáticos que podem ser cacheados
const STATIC_CACHE = [
  '/',
  '/index.html'
];

// Arquivos dinâmicos que precisam de validação frequente
const DYNAMIC_FILES = [
  '/css/arbipro-styles.css',
  '/css/calculator-styles.css',
  '/css/freepro-styles.css',
  '/js/app-config.js',
  '/js/arbipro.js',
  '/js/casas-regulamentadas.js',
  '/js/freepro-content.js',
  '/js/helpers.js'
];

// Instalação - cachear apenas assets críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nova versão:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache criado');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => self.skipWaiting()) // Ativar imediatamente
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando nova versão');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('shark-calc-')) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Cache antigo removido, tomando controle');
      return self.clients.claim(); // Tomar controle imediatamente
    })
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que não são GET
  if (request.method !== 'GET') return;

  // Ignorar chrome extensions e outros protocolos
  if (!url.protocol.startsWith('http')) return;

  // NUNCA cachear recursos do bundle do Vite (evita misturar versões)
  const isViteBundle =
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/@id/');

  if (isViteBundle) {
    event.respondWith(fetch(request));
    return;
  }

  // Para arquivos dinâmicos (JS/CSS), sempre buscar da rede primeiro
  if (DYNAMIC_FILES.some(file => url.pathname.includes(file))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Navegação (HTML): network-first com fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Outros recursos (imagens, etc.): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
