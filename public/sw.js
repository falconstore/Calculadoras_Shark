// Service Worker com cache inteligente e atualização automática
const CACHE_VERSION = 'shark-calc-v2.1';
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

// Fetch - estratégia Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests que não são GET
  if (request.method !== 'GET') return;
  
  // Ignorar chrome extensions e outros protocolos
  if (!url.protocol.startsWith('http')) return;
  
  // Para arquivos dinâmicos (JS/CSS), sempre buscar da rede primeiro
  if (DYNAMIC_FILES.some(file => url.pathname.includes(file))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clonar a resposta antes de retornar
          const responseClone = response.clone();
          
          // Atualizar cache em background
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          
          return response;
        })
        .catch(() => {
          // Se falhar, tentar o cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Para outros recursos, usar cache-first
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          // Atualizar em background
          fetch(request).then(response => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response);
            });
          }).catch(() => {});
          
          return cached;
        }
        
        return fetch(request).then(response => {
          // Cachear nova resposta
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
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
