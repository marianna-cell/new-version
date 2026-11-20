/* sw.js — минимальный service worker для PWA (offline-кэш оболочки). */
const CACHE = 'kw-v1';
const ASSETS = [
  '/', '/index.html', '/styles/style.css',
  '/scripts/main.js', '/scripts/views.js', '/scripts/store.js', '/scripts/ui.js', '/scripts/data.js',
  '/data/topics.json', '/manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('/index.html'))),
  );
});