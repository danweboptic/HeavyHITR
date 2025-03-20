const CACHE_NAME = 'heavyhitr-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/app.js',
  '/js/config.js',
  '/js/audio/AudioManager.js',
  '/js/audio/SpeechManager.js',
  '/js/workout/WorkoutManager.js',
  '/js/ui/UIController.js',
  '/js/storage/StorageManager.js',
  '/js/visualization/VisualizationManager.js',
  '/js/data/ExerciseTemplates.js',
  // Add icons and other assets
  // '/icons/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // '/icons/maskable_icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache each URL individually to handle failures gracefully
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.error('Failed to cache:', url, error);
              // Continue with other files even if one fails
              return Promise.resolve();
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
                  .catch(error => {
                    console.error('Failed to cache response:', error);
                  });
              });

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // You might want to return a custom offline page here
            return new Response('Offline');
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});