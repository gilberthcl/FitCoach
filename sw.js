const CACHE = 'fitcoach-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
];

// Install: cache core assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
// GIF images and API calls always go to network
self.addEventListener('fetch', function(e){
  var url = e.request.url;

  // Always fetch from network: API calls and exercise GIFs
  if(url.includes('anthropic.com') ||
     url.includes('hasaneyldrm') ||
     url.includes('meridian-fitness') ||
     url.includes('ocoach.app')){
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        // Cache new successful responses
        if(response && response.status === 200 && response.type === 'basic'){
          var clone = response.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
        }
        return response;
      });
    }).catch(function(){
      // Offline fallback
      return caches.match('./index.html');
    })
  );
});
