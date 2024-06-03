let CACHE_NAME = 'lernprogramm-cache-v1';
const urlsToCache = [
  '/~s85567/',
  '/~s85567/index.html',
  '/~s85567/css/styles.css',
  '/~s85567/js/app.js?v=' + Date.now(), 
  '/~s85567/data/questions.json?v=' + Date.now(),
  '/~s85567/bilder/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          });
      })
  );
});

function deleteOldCaches(currentCacheName) {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.filter(cacheName => {
        return cacheName !== currentCacheName;
      }).map(cacheName => {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    deleteOldCaches(CACHE_NAME)
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'checkForUpdates') {
    fetch('/version.json')
      .then(response => response.json())
      .then(data => {
        if (data.version !== CACHE_NAME) {
          caches.open(data.version)
            .then(cache => {
              cache.addAll(urlsToCache)
                .then(() => {
                  CACHE_NAME = data.version;
                });
            });
        }
      })
      .catch(error => self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage('Error checking for updates: ' + error); 
        });
      }));
  } else if (event.data === 'getVersionNumber') {
    event.source.postMessage({ version: CACHE_NAME });
  }
});
