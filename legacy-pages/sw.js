// Replaces the old StoryBloom offline worker on the github.io address: clears the old copy and sends people to unscrolled.me.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: "window" })) c.navigate("https://unscrolled.me/");
})()));
