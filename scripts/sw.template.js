/* StoryBloom service worker: saves the entire app on first visit so it works fully offline.
   Reports progress to the page ("Saving for offline… 40%") and retries files that fail on patchy Wi-Fi. */
const CACHE = "storybloom-__VERSION__";
const FILES = __FILES__;

async function tell(msg) {
  for (const c of await self.clients.matchAll({ type: "window", includeUncontrolled: true })) c.postMessage(msg);
}
async function save(c, url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (res.ok) return c.put(url, res);
      if (res.status === 401) throw new Error("locked"); // no valid pass: stop, the app will ask for a code
    } catch (err) {
      if (err.message === "locked") throw err;
    }
    await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
  }
  throw new Error("could not save " + url);
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const have = new Set((await c.keys()).map(r => new URL(r.url).pathname));
    const todo = FILES.filter(f => !have.has(new URL(f, self.registration.scope).pathname));
    let done = FILES.length - todo.length;
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(f => save(c, f)));
      done = Math.min(FILES.length, done + 6);
      tell({ type: "progress", done, total: FILES.length });
    }
    self.skipWaiting();
  })().catch(async err => { await tell({ type: "failed", reason: String(err.message || err) }); throw err; }));
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("storybloom-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    await tell("cached");
  })());
});
self.addEventListener("message", e => {
  if (e.data === "status") caches.has(CACHE).then(async has => {
    const n = has ? (await (await caches.open(CACHE)).keys()).length : 0;
    e.source.postMessage({ type: "status", ready: has && n >= FILES.length, done: n, total: FILES.length });
  });
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(e.request); } catch (err) { return caches.match("index.html"); }
  })());
});
