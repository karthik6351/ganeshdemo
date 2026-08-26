// service-worker.js

const CACHE_NAME = "wcyf-static-v1";

const STATIC_ASSETS = [
  // Core pages
  "index.html",
  "home.html",
  "money-collection.html",
  "dailycollection.html",
  "expenditure.html",
  "tasks.html",
  "events.html",
  "previous-years.html",
  "2025money.html",
  "2025items.html",

  // Icons / images
  "assets/images/logo.png",
  "assets/images/logo-192.png",
  "assets/images/logo-512.png"
];

// Install: cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1) Navigation requests (typing URL, clicking links)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("home.html"))
    );
    return;
  }

  // 2) API calls: always go to network (no caching)
  if (url.pathname.startsWith("/api/")) {
    return; // default: network
  }

  // 3) Same-origin GET requests: cache-first
  if (url.origin === self.location.origin && request.method === "GET") {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Optionally save new static assets
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
