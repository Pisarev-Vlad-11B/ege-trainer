const CACHE_NAME = "ege-trainer-v2";

const APP_FILES = [
  "/ege-trainer/",
  "/ege-trainer/index.html",
  "/ege-trainer/manifest.json",
  "/ege-trainer/favicon.svg",
  "/ege-trainer/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(
        APP_FILES.map(file =>
          cache.add(file).catch(error => {
            console.warn("Не удалось сохранить:", file, error);
          })
        )
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("ege-trainer-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put("/ege-trainer/index.html", copy);
          });
          return response;
        })
        .catch(async () => {
          return (
            await caches.match("/ege-trainer/index.html")
          ) || Response.error();
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
