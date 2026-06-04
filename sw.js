/* ── Komal's Love World — Service Worker ── */
const CACHE = 'love-world-v2';

const ASSETS = [
  './',
  './index.html',
  './love-shower-game.html',
  './kawaii-fruit-drop.html',
  './komal-cute.html',
  './cute.html',
  './komal-birthday.html',
  './komal-birthday-multiscreen.html',
  './komal-surprise.html',
  './manifest.json',
  './notifications.json',
  './pwa.js',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

/* ── Install: cache all pages ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))
    ).catch(() => {})
  );
  self.skipWaiting();
});

/* ── Activate: drop old caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch: cache-first, network fallback ── */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

/* ── Push: show notification from server ── */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || "Komal's Love World 💕", {
      body:    data.body    || 'Something sweet is waiting for you!',
      icon:    data.icon    || './icons/icon.svg',
      badge:   './icons/icon.svg',
      tag:     data.tag     || 'love-world',
      vibrate: data.vibrate || [200, 100, 200],
      data:    { url: data.url || './' },
    })
  );
});

/* ── Notification click: open/focus the URL ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url) && 'focus' in c);
      return existing ? existing.focus() : clients.openWindow(url);
    })
  );
});
