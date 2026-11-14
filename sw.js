const CACHE_NAME = 'toko-aya-v1';
const assetsToCache = [
  'index.html',
  'keranjang.html',
  'style.css',
  'script.js',
  'data/products.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Fetch Cache saat offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});