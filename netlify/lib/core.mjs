// StoryBloom shop logic: settings, members (codes), orders, passes.
import { store, listJSON } from "./store.mjs";
import { signPass, readPass, parseJwk } from "./pass.mjs";

export const DAY = 86400000;

export function cfg() {
  const env = process.env;
  return {
    mode: (env.SALES_MODE || "waitlist").toLowerCase(), // waitlist | founding | open | closed
    foundingLimit: Number(env.FOUNDING_LIMIT || 100),
    foundingPrice: Number(env.FOUNDING_PRICE || 39),
    regularPrice: Number(env.REGULAR_PRICE || 79),
    maxDevices: Number(env.MAX_DEVICES || 3),
    checkinDays: Number(env.CHECKIN_DAYS || 35),
    yearDays: 365
  };
}

export const siteUrl = () => (process.env.SITE_URL || process.env.URL || "http://localhost:8888").replace(/\/$/, "");
export const privateKey = () => parseJwk(process.env.PASS_PRIVATE_JWK);

/* ---------- http helpers ---------- */
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
}
export async function body(req) {
  try { return await req.json(); } catch { return {}; }
}
export const clean = (s, n = 80) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n);
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/* ---------- codes ---------- */
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
function toCode(bytes) {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHA[bytes[i] % ALPHA.length];
  return "BLOOM-" + s.slice(0, 4) + "-" + s.slice(4);
}
export function randomCode() {
  return toCode(crypto.getRandomValues(new Uint8Array(8)));
}
// Same payment always gives the same code, so a double notification can't create two members.
export async function codeForPayment(pi) {
  const secret = (privateKey() || {}).d || "storybloom";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toCode(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("pi:" + pi))));
}
export function normCode(input) {
  const raw = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const s = raw.startsWith("BLOOM") ? raw.slice(5) : raw;
  return s.length === 8 ? "BLOOM-" + s.slice(0, 4) + "-" + s.slice(4) : null;
}

/* ---------- members ---------- */
export const getMember = code => store().get("member/" + code);
export const saveMember = m => store().setJSON("member/" + m.code, m);

export async function createMember({ code, name, email, phone, plan, price, source, days, order, note }) {
  code = code || randomCode();
  const existing = await getMember(code);
  if (existing) return existing;
  const now = Date.now();
  const m = {
    code, name: clean(name, 60), email: clean(email, 120).toLowerCase(), phone: clean(phone, 30),
    plan, price: Number(price || 0), source, note: clean(note, 200),
    created: now, until: now + (days || cfg().yearDays) * DAY,
    devices: [], revoked: false, orders: order ? [order] : [], reminders: {}
  };
  await saveMember(m);
  if (plan === "founding") await refreshStats();
  return m;
}

export async function refreshStats() {
  const members = await listJSON("member/");
  const stats = { founding: members.filter(m => m.plan === "founding").length, members: members.length, updated: Date.now() };
  await store().setJSON("stats", stats);
  return stats;
}

export async function offer() {
  const c = cfg();
  const stats = (await store().get("stats")) || { founding: 0 };
  const foundingLeft = Math.max(0, c.foundingLimit - (stats.founding || 0));
  const base = { mode: c.mode, foundingLeft, foundingLimit: c.foundingLimit, foundingPrice: c.foundingPrice, regularPrice: c.regularPrice };
  if (c.mode === "founding" && foundingLeft > 0) return { ...base, sale: true, plan: "founding", price: c.foundingPrice };
  if (c.mode === "founding" || c.mode === "open") return { ...base, sale: true, plan: "regular", price: c.regularPrice };
  return { ...base, sale: false };
}

/* ---------- passes ---------- */
export async function issuePass(m, device, req) {
  const key = privateKey();
  if (!key) throw new Error("PASS_PRIVATE_JWK is not set");
  const now = Date.now();
  const payload = { c: m.code, d: device, p: m.plan, u: m.until, k: Math.min(m.until, now + cfg().checkinDays * DAY), i: now };
  const token = await signPass(payload, key);
  // Secure only when this request really came over https: on plain http (e.g. a new domain before its
  // certificate is ready) a Secure cookie would be dropped and the app's content would stay locked.
  const proto = req ? (req.headers.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "")) : "https";
  const secure = proto === "https" ? "; Secure" : "";
  const maxAge = Math.max(60, Math.floor((payload.k - now) / 1000));
  const cookie = `sb_pass=${token}; Path=/app; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
  return { token, payload, cookie };
}
export const readToken = token => readPass(token, privateKey());

/* Adds the device to the member if there is room. Returns an error string or null. */
export function attachDevice(m, device) {
  const now = Date.now();
  const d = m.devices.find(x => x.id === device);
  if (d) { d.last = now; return null; }
  if (m.devices.length >= cfg().maxDevices) return "device_limit";
  m.devices.push({ id: device, first: now, last: now });
  return null;
}

export function memberState(m) {
  if (!m) return "unknown";
  if (m.revoked) return "revoked";
  if (m.until <= Date.now()) return "expired";
  return "active";
}

/* ---------- orders ---------- */
export const getOrder = pi => store().get("order/" + pi);
export const saveOrder = o => store().setJSON("order/" + o.pi, o);

// Turns a completed Ziina payment into a member (or a renewal). Safe to call more than once.
export async function fulfil(order, intent) {
  if (order.status === "fulfilled") return { member: await getMember(order.code), fresh: false };
  if (!intent || intent.status !== "completed") return { member: null, fresh: false, status: intent && intent.status };
  const paid = Number(intent.amount);
  if (paid !== Math.round(order.price * 100) || String(intent.currency_code || "AED").toUpperCase() !== "AED") {
    order.status = "mismatch"; order.seen = { amount: paid, currency: intent.currency_code };
    await saveOrder(order);
    return { member: null, fresh: false, status: "mismatch" };
  }
  let m;
  if (order.kind === "renew") {
    m = await getMember(order.code);
    if (!m) return { member: null, fresh: false, status: "missing" };
    if (!m.orders.includes(order.pi)) {
      m.until = Math.max(Date.now(), m.until) + cfg().yearDays * DAY;
      m.orders.push(order.pi); m.reminders = {}; m.revoked = false;
      m.plan = order.plan; m.price = order.price;
      await saveMember(m);
    }
  } else {
    m = await createMember({
      code: await codeForPayment(order.pi), name: order.name, email: order.email, phone: order.phone,
      plan: order.plan, price: order.price, source: "ziina", order: order.pi
    });
  }
  order.status = "fulfilled"; order.code = m.code; order.fulfilledAt = Date.now();
  await saveOrder(order);
  return { member: m, fresh: true };
}
