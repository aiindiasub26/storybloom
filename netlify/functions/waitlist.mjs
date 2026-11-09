// POST /api/waitlist → saves an early-access sign-up (email required, WhatsApp optional).
import { json, body, clean, validEmail } from "../lib/core.mjs";
import { store, listJSON } from "../lib/store.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const b = await body(req);
  const email = clean(b.email, 120).toLowerCase();
  const entry = {
    name: clean(b.name, 60), email, phone: clean(b.phone, 30), age: clean(b.age, 20),
    country: clean(b.country, 40), source: clean(b.source, 40), meet: !!b.meet, at: Date.now()
  };
  if (!entry.name || !validEmail(email)) return json({ error: "Please add your name and a valid email, so we can send your code." }, 400);
  if (clean(b.website, 10)) return json({ ok: true }); // honeypot field: bots fill it, people don't
  const already = (await listJSON("waitlist/")).some(w => (w.email || w.contact || "").toLowerCase() === email);
  if (already) return json({ ok: true, already: true });
  entry.id = `${entry.at}-${Math.random().toString(36).slice(2, 8)}`;
  await store().setJSON("waitlist/" + entry.id, entry);
  return json({ ok: true });
};
export const config = { path: "/api/waitlist" };
