// Local test server that behaves like Netlify: static files from site/, /api/* functions,
// the /app/* edge gate, and a fake Ziina (/__ziina) so payments can be tested without money.
//   npm install && npm run dev   →  http://localhost:8888   (admin password: localadmin)
import http from "node:http";
import { promises as fs, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { generateKeyJwk } from "../netlify/lib/pass.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8888);
const SITE = `http://localhost:${PORT}`;

// ---- environment (same names as on Netlify) ----
const keysFile = path.join(root, "dev", ".keys.json");
if (!existsSync(keysFile)) writeFileSync(keysFile, JSON.stringify(await generateKeyJwk()));
const env = {
  PASS_PRIVATE_JWK: readFileSync(keysFile, "utf8"),
  LOCAL_STORE: path.join(root, "dev", ".data"),
  SITE_URL: SITE,
  ZIINA_API_BASE: SITE + "/__ziina",
  ZIINA_API_KEY: "local-test",
  ZIINA_WEBHOOK_SECRET: "local-secret",
  ADMIN_PASSWORD: "localadmin",
  RESEND_API_BASE: SITE + "/__resend",
  RESEND_API_KEY: "local-test",
  SALES_MODE: process.env.SALES_MODE || "waitlist"
};
for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;
mkdirSync(process.env.LOCAL_STORE, { recursive: true });
globalThis.Netlify = { env: { get: k => process.env[k] } };

execFileSync("node", [path.join(root, "scripts", "build.mjs")], { stdio: "inherit", env: process.env });

// ---- load functions by their config.path ----
const routes = {};
for (const f of await fs.readdir(path.join(root, "netlify", "functions"))) {
  const mod = await import(pathToFileURL(path.join(root, "netlify", "functions", f)));
  if (mod.config && mod.config.path) routes[mod.config.path] = mod.default;
  if (mod.config && mod.config.schedule) routes["/__run/" + f.replace(/\.mjs$/, "")] = mod.default;
}
const gate = (await import(pathToFileURL(path.join(root, "netlify", "edge-functions", "gate.js")))).default;

// ---- fake Resend: emails are kept in memory, see /__resend/outbox ----
const outbox = [];

// ---- fake Ziina ----
const intents = new Map();
async function fakeZiina(req, url, raw) {
  const p = url.pathname.replace("/__ziina", "");
  if (p === "/payment_intent" && req.method === "POST") {
    const b = JSON.parse(raw);
    const id = "pi_" + Math.random().toString(36).slice(2, 12);
    intents.set(id, { id, amount: b.amount, currency_code: b.currency_code, status: "requires_payment_instrument", success_url: b.success_url, cancel_url: b.cancel_url });
    return Response.json({ id, redirect_url: `${SITE}/__ziina/pay/${id}` });
  }
  let m = p.match(/^\/payment_intent\/(.+)$/);
  if (m && req.method === "GET") return intents.has(m[1]) ? Response.json(intents.get(m[1])) : new Response("not found", { status: 404 });
  m = p.match(/^\/pay\/(.+)$/);
  if (m) {
    const it = intents.get(m[1]);
    if (!it) return new Response("unknown payment", { status: 404 });
    if (req.method === "POST") {
      it.status = "completed";
      return new Response(null, { status: 303, headers: { Location: it.success_url.replace("{PAYMENT_INTENT_ID}", it.id) } });
    }
    return new Response(`<!doctype html><meta name=viewport content="width=device-width"><body style="font-family:system-ui;padding:40px">
      <h2>Fake Ziina checkout</h2><p>AED ${(it.amount / 100).toFixed(2)}</p>
      <form method=post><button id=pay style="font-size:20px;padding:10px 20px">Pay (test)</button></form>
      <p><a href="${it.cancel_url}">Cancel</a></p>`, { headers: { "Content-Type": "text/html" } });
  }
  if (p === "/webhook") return Response.json({ ok: true });
  return new Response("fake ziina: unknown", { status: 404 });
}

// ---- static files ----
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".pdf": "application/pdf", ".ico": "image/x-icon" };
async function serveStatic(url) {
  let p = decodeURIComponent(url.pathname);
  if (p === "/app") return new Response(null, { status: 301, headers: { Location: "/app/" } });
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, "site", path.normalize(p).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(path.join(root, "site"))) return new Response("no", { status: 403 });
  try {
    const st = await fs.stat(file);
    if (st.isDirectory()) return new Response(null, { status: 301, headers: { Location: p + "/" } });
    return new Response(await fs.readFile(file), { headers: { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" } });
  } catch { return new Response("Not found", { status: 404 }); }
}

function cookiesOf(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach(c => { const i = c.indexOf("="); if (i > 0) out[c.slice(0, i).trim()] = c.slice(i + 1).trim(); });
  return out;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, SITE);
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  const request = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : raw });
  let response;
  try {
    if (url.pathname.startsWith("/__ziina")) response = await fakeZiina(req, url, raw);
    else if (url.pathname === "/__resend/emails") { outbox.push({ ...JSON.parse(raw), at: Date.now() }); response = Response.json({ id: "email_" + outbox.length }); }
    else if (url.pathname === "/__resend/outbox") response = Response.json(outbox);
    else if (routes[url.pathname]) response = await routes[url.pathname](request, {});
    else if (url.pathname.startsWith("/app/")) {
      const NEXT = Symbol("next");
      const c = cookiesOf(req);
      const r = await gate(request, { cookies: { get: k => c[k] }, next: () => NEXT });
      response = r && r !== NEXT ? r : await serveStatic(url);
    } else response = await serveStatic(url);
  } catch (e) {
    console.error(e); response = new Response("server error: " + e.message, { status: 500 });
  }
  const headers = {};
  response.headers.forEach((v, k) => { headers[k] = k === "set-cookie" ? response.headers.getSetCookie() : v; });
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(PORT, () => console.log(`unscrolled.me running locally at ${SITE}  (SALES_MODE=${process.env.SALES_MODE})`));
