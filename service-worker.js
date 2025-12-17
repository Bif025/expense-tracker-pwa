// service-worker.js - Minimal Version
const CACHE_NAME = 'app-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
  // Add other important files here
];

// ========== INSTALL EVENT ==========
// Runs when service worker is first installed
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  // Wait until caching is complete
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// ========== ACTIVATE EVENT ==========
// Runs when service worker is activated
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  return self.clients.claim(); // Take control immediately
});

// ========== FETCH EVENT ==========
// Intercepts all network requests
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  
  event.respondWith(
    // Try cache first, then network
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if found
        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Cache the new response for next time
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, response.clone());
                return response;
              });
          })
          .catch(error => {
            // Optional: Return offline page if network fails
            console.log('Fetch failed; returning offline page');
            return caches.match('/offline.html');
          });
      })
  );
});
