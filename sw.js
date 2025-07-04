const CACHE_NAME = 'vloto-v1.0.0';
const urlsToCache = [
  '/',
  '/vietlot45/vietlot45.html',
  '/vietlot55/vietlot55.html',
  '/vietlot45/vietlot45.js',
  '/vietlot55/vietlot55.js',
  '/vietlot45/json-data/vietlot45-data.json',
  '/vietlot45/json-data/day-of-week-summary.json',
  '/vietlot45/json-data/day-of-month-summary.json',
  '/vietlot45/json-data/month-summary.json',
  '/vietlot45/json-data/even-odd-summary.json',
  '/vietlot55/json-data/vietlot55-data.json',
  '/vietlot55/json-data/day-of-week-summary.json',
  '/vietlot55/json-data/day-of-month-summary.json',
  '/vietlot55/json-data/month-summary.json',
  '/vietlot55/json-data/even-odd-summary.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateLotteryData());
  }
});

async function updateLotteryData() {
  try {
    // Update vietlot45 data
    const response45 = await fetch('/vietlot45/json-data/vietlot45-data.json');
    if (response45.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/vietlot45/json-data/vietlot45-data.json', response45.clone());
    }

    // Update vietlot55 data
    const response55 = await fetch('/vietlot55/json-data/vietlot55-data.json');
    if (response55.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/vietlot55/json-data/vietlot55-data.json', response55.clone());
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
} 
