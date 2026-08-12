// sw.js
const CACHE_NAME = 'wordle-skyeto-v1';

// Danh sách các file cần lưu cache để chơi Offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './words.js',
  './manifest.json',
  './libraryskyeto.txt',
  './home.png',
  './skyeto1.png',
  './skyeto2.png',
  './skyeto3.png',
  './skyeto4.png',
  './skyeto5.png',
  './skyeto6.png'
];

// Cài đặt Service Worker và lưu Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Skyeto SW: Caching all assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Kích hoạt SW và dọn dẹp cache cũ nếu có
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Skyeto SW: Clearing old cache...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Xử lý khi ứng dụng tải tài nguyên (Offline First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Trả về file trong Cache nếu có, nếu không thì mới tải qua mạng
      return cachedResponse || fetch(event.request);
    })
  );
});