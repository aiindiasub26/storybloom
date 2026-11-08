/* StoryBloom service worker: caches the entire app on first visit so it works fully offline. */
const CACHE = "storybloom-__VERSION__";
const FILES = __FILES__;
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // add in small groups so one slow file doesn't fail the whole install
    for (let i = 0; i < FILES.length; i += 20) await c.addAll(FILES.slice(i, i + 20));
    self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    (await self.clients.matchAll()).forEach(c => c.postMessage("cached"));
  })());
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(e.request); } catch (err) { return caches.match("index.html"); }
  })());
});
