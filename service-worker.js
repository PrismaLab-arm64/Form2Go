const CACHE_NAME = "form2go-cache-v7";

const ASSETS = [
  "/Form2Go/",
  "/Form2Go/index.html",
  "/Form2Go/manifest.json",
  "/Form2Go/css/styles.css",
  "/Form2Go/js/app.js",
  "/Form2Go/assets/icons/icon-192.png",
  "/Form2Go/assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
