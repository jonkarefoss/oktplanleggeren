// Enkel offline-støtte: siden hentes fra nett når det går, ellers fra lager.
// Filer med hash i navnet (assets/) endres aldri og hentes fra lager først.
const CACHE = "okt-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "precache") {
    // Lagre filene denne versjonen bruker, og fjern filer fra eldre versjoner.
    const wanted = new Set(event.data.urls);
    event.waitUntil(
      caches
        .open(CACHE)
        .then(async (c) => {
          await c.addAll(event.data.urls);
          for (const req of await c.keys()) if (!wanted.has(req.url)) await c.delete(req);
        })
        .catch(() => {}),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreVary: true }).then((r) => r || caches.match("./", { ignoreVary: true }))),
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
