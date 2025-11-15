const CACHE_NAME = 'dwellable-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/join.html',
  '/home.png',
  '/reminders.png', 
  '/property_info.png',
  '/inspection.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});