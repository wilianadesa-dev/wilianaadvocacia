// ═══════════════════════════════════════════════
// SERVICE WORKER — Wiliana de Sá Advocacia PWA
// Cache offline + sincronização em background
// ═══════════════════════════════════════════════

const CACHE_NAME = 'wiliana-adv-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instalar: cachear recursos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS).catch(err => {
        console.warn('Cache parcial:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativar: limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: servir do cache quando offline
self.addEventListener('fetch', event => {
  // Não interceptar requests do Supabase (dados sempre frescos)
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cachear resposta válida
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: servir do cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback para a página principal
          return caches.match('/');
        });
      })
  );
});

// Background sync quando voltar online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-dados') {
    console.log('Background sync: sincronizando dados...');
  }
});

// Notificações push (futuro)
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || 'Wiliana Advocacia', {
    body: data.body || 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'notif',
    data: data
  });
});
