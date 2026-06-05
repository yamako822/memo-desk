const CACHE = "memo-desk-v28";

const ASSETS = [
  "./",
  "./index.html",
  "./local.html",
  "./memo.html",
  "./styles.css",
  "./app.js",
  "./pwa.js",
  "./firebase-config.js",
  "./feedback-config.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/help-memo-create.svg?v=3",
  "./images/help-find-filter.svg?v=3",
  "./images/help-organize.svg?v=3",
  "./images/help-settings.svg?v=3",
  "./images/outlook-help-step-1.svg?v=3",
  "./images/outlook-help-step-2.svg?v=3",
  "./images/outlook-help-step-3.svg?v=3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const networkFirstDestinations = new Set(["document", "script", "style", "manifest"]);
  const shouldUseNetworkFirst =
    event.request.mode === "navigate" || networkFirstDestinations.has(event.request.destination);

  if (shouldUseNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;

        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
