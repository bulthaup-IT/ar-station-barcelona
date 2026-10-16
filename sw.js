/* Offline-Speicher der AR-Station. Diese Datei muss neben index.html liegen.
   Nur bei einer neuen Version von index.html CACHE hochzählen, sonst nichts ändern. */
var CACHE = "ar-station-v7-test-004";
var FILES = ["./", "./index.html"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILES.map(function (f) {
      return fetch(new Request(f, { cache: "reload" })).then(function (r) { if (r.ok) return c.put(f, r); });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Zuerst aus dem Offline-Speicher, nur wenn dort nichts liegt aus dem Netz */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).catch(function () {
        if (e.request.mode === "navigate") return c.match("./index.html");
        return Response.error();
      });
    });
  }));
});
