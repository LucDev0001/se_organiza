const CACHE_NAME = "se-organiza-v6";
// Apenas arquivos locais essenciais para o App Shell
const ASSETS = [
  "./",
  "./index.html",
  "./src/main.js",
  "./src/services/firebase.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Estratégia: Cache First, falling back to Network
  // E salva no cache qualquer nova requisição (Cache Dinâmico)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        // Se a resposta for válida, clona e salva no cache
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          (networkResponse.type !== "basic" && networkResponse.type !== "cors")
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
