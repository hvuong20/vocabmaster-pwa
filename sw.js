const CACHE_NAME = 'vocabmaster-v6';
const NOTIF_CACHE = 'vm-notif-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/data-c1.js',
  './js/data-c2.js',
  './js/data-ielts.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== NOTIF_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Open app (or focus existing tab) when notification is clicked
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Server Push — nhận từ push-server, hiện notification ngay lập tức (iOS + Android)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const word = data.word || 'VocabMaster';
  const body = [data.phonetic, data.meaning].filter(Boolean).join('\n');

  e.waitUntil(
    self.registration.showNotification('📚 ' + word, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'vocab-word',
      renotify: true,
      data: { url: '/' }
    })
  );
});

// Periodic Background Sync — fires when app is closed (Chrome Android, requires PWA install)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'vocab-reminder') {
    e.waitUntil(showScheduledWord());
  }
});

async function showScheduledWord() {
  try {
    const cache = await caches.open(NOTIF_CACHE);
    const resp = await cache.match('/notif-data');
    if (!resp) return;

    const data = await resp.json();
    const { settings, wordQueue } = data;
    if (!settings || !settings.enabled || !wordQueue || !wordQueue.length) return;

    const h = new Date().getHours();
    if (h < settings.startHour || h >= settings.endHour) return;

    const idx = settings.wordIndex % wordQueue.length;
    const word = wordQueue[idx];
    settings.wordIndex = (idx + 1) % wordQueue.length;
    settings.lastShownAt = new Date().toISOString();

    // Persist updated index back to cache
    await cache.put('/notif-data', new Response(JSON.stringify({ settings, wordQueue }), {
      headers: { 'Content-Type': 'application/json' }
    }));

    await self.registration.showNotification('📚 ' + word.word, {
      body: word.phonetic + '\n' + word.meaning,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'vocab-word',
      renotify: true,
      data: { url: '/' }
    });
  } catch (_) {}
}
