// POST /api/waitlist → saves an early-access sign-up.
import { json, body, clean } from "../lib/core.mjs";
import { store } from "../lib/store.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const b = await body(req);
  const entry = {
    name: clean(b.name, 60), contact: clean(b.contact, 120), age: clean(b.age, 20),
    country: clean(b.country, 40), source: clean(b.source, 40), meet: !!b.meet, at: Date.now()
  };
  if (!entry.name || !entry.contact) return json({ error: "Please add your name and WhatsApp or email." }, 400);
  if (clean(b.website, 10)) return json({ ok: true }); // honeypot field: bots fill it, people don't
  await store().setJSON(`waitlist/${entry.at}-${Math.random().toString(36).slice(2, 8)}`, entry);
  return json({ ok: true });
};
export const config = { path: "/api/waitlist" };
